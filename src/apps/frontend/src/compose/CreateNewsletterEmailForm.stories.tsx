import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import type { ApiError } from '../api-client/errors';
import {
	badRequestError,
	failedNewsletterSendResponse,
	fetchFailError,
	internalError,
	jsonParseFailure,
	noPermissionError,
	partiallyDeliveredNewsletterSendResponse,
	unauthenticatedError,
} from '../testing/api-fixtures';
import { liveblogFixture } from '../testing/capi-fixtures';
import {
	mockSendNotification,
	mockSendRejectedNotification,
} from '../testing/mock-send-notification';
import {
	completeNewsletterEmailFormValues,
	populatedNewsletterEmailComposerState,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import { defaultComposerState } from '../utils/notification-composer-reducer';
import { CreateNewsletterEmailForm } from './CreateNewsletterEmailForm';
import type { NotificationFormContextProps } from './NotificationFormContext';

type StoryArgs = {
	composerState: NotificationComposerState;
	showPreview: boolean;
	onTogglePreview: (showPreview: boolean) => void;
	resolveArticleFromCapi?: NotificationFormContextProps['resolveArticleFromCapi'];
	sendNotification?: NotificationFormContextProps['sendNotification'];
};
type Story = StoryObj<StoryArgs>;

const ControlledCreateNewsletterEmailForm = ({
	initialShowPreview,
}: {
	initialShowPreview: boolean;
}) => {
	const [showPreview, setShowPreview] = useState(initialShowPreview);

	return (
		<CreateNewsletterEmailForm
			showPreview={showPreview}
			onTogglePreview={setShowPreview}
		/>
	);
};

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Compose/CreateNewsletterEmailForm',
	component: CreateNewsletterEmailForm,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The form for creating a newsletter email notification. This story shows the form in various states, including empty, populated, and error states.',
			},
		},
	},
	args: {
		composerState: defaultComposerState,
		showPreview: true,
		onTogglePreview: () => {},
	},
	render: function Render(args) {
		const { composerState, resolveArticleFromCapi, showPreview } = args;
		return useNotificationFormStory(
			<ControlledCreateNewsletterEmailForm initialShowPreview={showPreview} />,
			composerState,
			{ resolveArticleFromCapi, sendNotification: args.sendNotification },
			'newsletter',
			composerState.article ? completeNewsletterEmailFormValues : undefined,
		);
	},
};

export default meta;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('Create newsletter email'),
		).toBeInTheDocument();
		await expect(canvas.getByText('Article')).toBeInTheDocument();
		await expect(canvas.getByText('Kicker')).toBeInTheDocument();
		await expect(
			canvas.getByRole('button', { name: 'Choose a kicker Kicker' }),
		).toBeVisible();
		await expect(canvas.getByText('Subject')).toBeInTheDocument();
		await expect(canvas.getByText('Show preview text')).toBeInTheDocument();
		await expect(canvas.getByText('Preview text')).toBeInTheDocument();
		await expect(
			canvas.getByText('The newsletter email is sent immediately'),
		).toBeVisible();
		await expect(canvas.getByText('Sends right now via Braze')).toBeVisible();
	},
};

export const UpdatesFormFields: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const unitedKingdom = canvas.getByRole('checkbox', {
			name: 'Select United Kingdom',
		});

		await userEvent.click(unitedKingdom);

		await expect(unitedKingdom).toBeChecked();
	},
};

export const ImportWithoutStandfirstPreservesPreviewText: Story = {
	args: {
		resolveArticleFromCapi: () =>
			Promise.resolve({
				success: true,
				data: { article: liveblogFixture },
			}),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const previewText = 'Saved preview text';
		const previewTextInput = canvas.getByLabelText('Preview text');

		await userEvent.type(previewTextInput, previewText);
		await userEvent.type(
			canvas.getByLabelText('article URL'),
			liveblogFixture.webUrl,
		);
		await userEvent.click(canvas.getByRole('button', { name: 'Fetch' }));

		await expect(await canvas.findByText('Article imported')).toBeVisible();
		await expect(previewTextInput).toHaveValue(previewText);
	},
};

export const SelectNoKicker: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);
		const kicker = canvas.getByRole('button', {
			name: 'Choose a kicker Kicker',
		});

		await userEvent.click(kicker);
		await userEvent.click(screen.getByRole('option', { name: 'None' }));

		await expect(kicker).toHaveAccessibleName('None Kicker');
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent('0/46');

		const subjectTextInput = canvas.getByLabelText('Subject');
		const subjectText = 'Edited subject text';
		await userEvent.type(subjectTextInput, subjectText);
		await expect(subjectTextInput).toHaveValue(subjectText);
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent(`${subjectText.length}/46`);

		await userEvent.click(kicker);
		await userEvent.click(
			screen.getByRole('option', { name: 'Breaking news' }),
		);
		await expect(subjectTextInput).toHaveValue(subjectText);
		await expect(
			canvas.getByLabelText('Subject character count'),
		).toHaveTextContent(`${'Breaking news: '.length + subjectText.length}/46`);
	},
};

export const ValidationErrors: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole('button', { name: 'Send newsletter email' }),
		);

		await expect(canvas.getByText('Subject is required')).toBeVisible();
		await expect(canvas.getByText('Please select a kicker')).toBeVisible();
		await expect(
			canvas.getByText('Please select an audience segment'),
		).toBeVisible();
		await expect(
			canvas.getByText('Paste a URL to fetch an article'),
		).toBeVisible();
	},
};

export const NewsletterDeliveryFailure: Story = {
	args: {
		composerState: {
			...populatedNewsletterEmailComposerState,
			sendFailure: {
				failure: 'dispatch-fail',
				notification: failedNewsletterSendResponse,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);

		await expect(
			await screen.findByText('The newsletter email had delivery issues'),
		).toBeVisible();
		await expect(
			screen.getByText(
				'The newsletter delivery service reported a failure for all destinations.',
			),
		).toBeVisible();
		await expect(
			screen.getByText('Delivery not confirmed for: United Kingdom'),
		).toBeVisible();
		await expect(
			screen.getByText('Reference: email-failed-1234'),
		).toBeVisible();
	},
};

export const PartialNewsletterDeliveryFailure: Story = {
	args: {
		composerState: {
			...populatedNewsletterEmailComposerState,
			sendFailure: {
				failure: 'dispatch-fail',
				notification: partiallyDeliveredNewsletterSendResponse,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);

		await expect(
			await screen.findByText(
				'The newsletter email had partial delivery issues',
			),
		).toBeVisible();
		await expect(
			screen.getByText('Accepted for delivery to: United Kingdom'),
		).toBeVisible();
		await expect(
			screen.getByText('Delivery not confirmed for: United States'),
		).toBeVisible();
		await expect(
			screen.getByText('Reference: email-partial-1234'),
		).toBeVisible();
	},
};

export const PastRecommendedStillSends: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const subjectTextInput = canvas.getByLabelText('Subject');
		await userEvent.clear(subjectTextInput);
		await userEvent.type(subjectTextInput, 'a'.repeat(140));

		await expect(canvas.getByText('Warning')).toBeVisible();
		await expect(canvas.getByText('Recommended')).toBeVisible();
		await expect(
			canvas.getByText('46 characters or fewer preferred'),
		).toBeVisible();
		await expect(
			canvas.getByText('85 characters or fewer preferred'),
		).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Send newsletter email' }),
		);

		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText(
				'Are you sure you want to send the newsletter email?',
			),
		).toBeVisible();
	},
};

export const Empty: Story = {
	args: {
		composerState: {
			isFetchingArticle: false,
			isSendConfirmationOpen: false,
			isWaitingForSend: false,
		},
	},
};

export const FetchingArticle: Story = {
	args: {
		composerState: {
			...defaultComposerState,
			isFetchingArticle: true,
		},
	},
};

export const FetchArticleError: Story = {
	args: {
		composerState: {
			...defaultComposerState,
			isFetchingArticle: false,
			fetchArticleError: 'Failed to fetch article',
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole('button', { name: 'Send newsletter email' }),
		);

		await expect(canvas.getByText('Failed to fetch article')).toBeVisible();
		await expect(
			canvas.queryByText('Paste a URL to fetch an article'),
		).toBeNull();
	},
};

export const PopulatedNewsletterEmail: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
	},
};

export const PreviewTextToggleHidesField: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Show preview text' });
		const previewTextInput = canvas.getByLabelText('Preview text');

		await expect(previewTextInput).toBeVisible();
		await userEvent.clear(previewTextInput);
		await userEvent.type(previewTextInput, 'Saved preview text');
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');
		await expect(canvas.queryByLabelText('Preview text')).toBeNull();
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
		await expect(canvas.getByLabelText('Preview text')).toHaveValue(
			'Saved preview text',
		);
	},
};

const sendNewsletterEmailWithoutPreviewText =
	fn<NotificationFormContextProps['sendNotification']>(mockSendNotification);

export const PreviewTextExcludedFromSend: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
		sendNotification: sendNewsletterEmailWithoutPreviewText,
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);
		const subjectText = 'Edited subject text';
		const subjectTextInput = canvas.getByLabelText('Subject');
		await userEvent.clear(subjectTextInput);
		await userEvent.type(subjectTextInput, subjectText);
		await userEvent.clear(canvas.getByLabelText('Preview text'));
		await userEvent.type(
			canvas.getByLabelText('Preview text'),
			'Saved preview text',
		);
		await userEvent.click(
			canvas.getByRole('button', { name: 'Show preview text' }),
		);
		await expect(
			canvas.queryByLabelText('Preview text'),
		).not.toBeInTheDocument();
		await userEvent.click(
			canvas.getByRole('button', { name: 'Send newsletter email' }),
		);
		await userEvent.click(
			await screen.findByRole('button', { name: 'Confirm send' }),
		);

		await waitFor(() => expect(args.sendNotification).toHaveBeenCalledOnce());
		const request = sendNewsletterEmailWithoutPreviewText.mock.calls[0]?.[0];
		await expect(request).toHaveProperty(
			'content.items.lead-story.title',
			subjectText,
		);
		await expect(request).toHaveProperty('content.items.lead-story.body', '');
		await expect(request).toHaveProperty(
			'channels.newsletter.compose.subject',
			`Exclusive: ${subjectText}`,
		);
	},
};

export const SubmitWithNativeForm: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const form = canvas.getByRole<HTMLFormElement>('form', {
			name: 'Create newsletter email',
		});
		await expect(form).toBeVisible();
		await expect(form).toHaveAttribute('method', 'post');
		await expect(form).toHaveAttribute('novalidate');
		form.requestSubmit();

		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText(
				'Are you sure you want to send the newsletter email?',
			),
		).toBeVisible();
	},
};

export const SendConfirmationStep: Story = {
	args: {
		composerState: {
			...populatedNewsletterEmailComposerState,
			isSendConfirmationOpen: true,
		},
	},
};

export const SendingNewsletterEmail: Story = {
	args: {
		composerState: {
			...populatedNewsletterEmailComposerState,
			isSendConfirmationOpen: true,
			isWaitingForSend: true,
		},
	},
};

const buildErrorStory = (error: ApiError): Story => ({
	args: {
		composerState: {
			...populatedNewsletterEmailComposerState,
			isWaitingForSend: false,
			sendFailure: error,
		},
	},
	render: function Render(args) {
		const { composerState, showPreview } = args;
		return useNotificationFormStory(
			<ControlledCreateNewsletterEmailForm initialShowPreview={showPreview} />,
			composerState,
			{
				sendNotification: mockSendRejectedNotification(error),
			},
			'newsletter',
			completeNewsletterEmailFormValues,
		);
	},
});

export const Unauthenticated: Story = buildErrorStory(unauthenticatedError);
export const BadRequest: Story = buildErrorStory(badRequestError);
export const InternalError: Story = buildErrorStory(internalError);
export const NoPermission: Story = buildErrorStory(noPermissionError);
export const UnparsableResponse: Story = buildErrorStory(jsonParseFailure);
export const FetchFailError: Story = buildErrorStory(fetchFailError);
