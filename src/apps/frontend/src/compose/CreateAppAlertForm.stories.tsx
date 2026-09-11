import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
	failedAppPushSendResponse,
	partiallyDeliveredAppPushSendResponse,
	unconfirmedAppPushSendResponse,
} from '../testing/api-fixtures';
import { articleFixture, liveblogFixture } from '../testing/capi-fixtures';
import {
	completePushParams,
	populatedPushState,
	WithNotificationContext,
} from '../testing/story-helpers';
import type { NotificationState } from '../types';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { defaultAppAlertState } from '../utils/notification-reducer';
import { CreateAppAlertForm } from './CreateAppAlertForm';

type StoryArgs = {
	notificationState: NotificationState;
	formValues?: Partial<AppAlertFormValues>;
};
type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Compose/CreateAppAlertForm',
	component: CreateAppAlertForm,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The form for creating an app alert notification. This story shows the form in various states, including empty, populated, and error states.',
			},
		},
	},
	args: {
		notificationState: defaultAppAlertState,
	},
	render: (args) => {
		const { formValues, notificationState } = args;
		return WithNotificationContext(
			<CreateAppAlertForm />,
			notificationState,
			{},
			'push',
			formValues ??
				(notificationState.content ? completePushParams : undefined),
		);
	},
};

export default meta;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Create app alert')).toBeInTheDocument();
		await expect(canvas.getByText('Article')).toBeInTheDocument();
		await expect(canvas.getByText('Alert type')).toBeInTheDocument();
		await expect(canvas.getByText('Editions')).toBeInTheDocument();
		await expect(canvas.getByText('Headline')).toBeInTheDocument();
		await expect(canvas.getByText('Delivery and timing')).toBeInTheDocument();
		await expect(canvas.getByText('Send')).toBeInTheDocument();
		await expect(
			canvas.getByText('The app alert is sent immediately'),
		).toBeVisible();
		await expect(canvas.getByText('Sends right now')).toBeVisible();
	},
};

export const UpdatesFormFields: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);
		const alertType = canvas.getByRole('button', {
			name: 'Breaking news Alert type',
		});
		const unitedKingdom = canvas.getByRole('checkbox', {
			name: 'Select United Kingdom',
		});
		const headline = canvas.getByLabelText('Headline');

		await userEvent.click(alertType);
		await userEvent.click(
			await screen.findByRole('option', { name: 'Sports news' }),
		);
		await userEvent.click(unitedKingdom);
		await userEvent.type(headline, 'A developing story');

		await expect(
			canvas.getByRole('button', { name: 'Sports news Alert type' }),
		).toBeVisible();
		await expect(unitedKingdom).toBeChecked();
		await expect(headline).toHaveValue('A developing story');
		await expect(
			canvas.getByLabelText('Headline character count'),
		).toHaveTextContent('18/');
	},
};

export const ValidationErrors: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole('button', { name: 'Send app alert' }),
		);

		await expect(canvas.getByText('Headline is required')).toBeVisible();
		await expect(canvas.getByText('Please select an edition')).toBeVisible();
		await expect(
			canvas.getByText('Paste a URL to fetch an article'),
		).toBeVisible();
	},
};

export const MobileNotificationServiceFailure: Story = {
	args: {
		notificationState: {
			...populatedPushState,
			sendFailure: {
				failure: 'dispatch-fail',
				notification: failedAppPushSendResponse,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);

		await expect(
			await screen.findByText('The app alert had delivery issues'),
		).toBeVisible();
		await expect(
			screen.getByText(
				'The mobile notification service reported a failure for all destinations.',
			),
		).toBeVisible();
		await expect(
			screen.getByText('Delivery not confirmed for: International'),
		).toBeVisible();
		await expect(screen.getByText('Reference: push-failed-1234')).toBeVisible();
		await expect(
			screen.queryByRole('button', { name: 'Try Again' }),
		).not.toBeInTheDocument();
	},
};

export const UnconfirmedMobileNotificationDelivery: Story = {
	args: {
		notificationState: {
			...populatedPushState,
			sendFailure: {
				failure: 'dispatch-fail',
				notification: unconfirmedAppPushSendResponse,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);

		await expect(await screen.findByText('Something went wrong')).toBeVisible();
		await expect(
			screen.getByText("We couldn't confirm whether the app alert was sent."),
		).toBeVisible();
		await expect(
			screen.getByText('Reference: push-unconfirmed-1234'),
		).toBeVisible();
		await expect(
			screen.queryByRole('button', { name: 'Try Again' }),
		).not.toBeInTheDocument();
	},
};

export const PartialMobileNotificationServiceFailure: Story = {
	args: {
		notificationState: {
			...populatedPushState,
			sendFailure: {
				failure: 'dispatch-fail',
				notification: partiallyDeliveredAppPushSendResponse,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);

		await expect(
			await screen.findByText('The app alert had partial delivery issues'),
		).toBeVisible();
		await expect(
			screen.getByText('Accepted for delivery to: UK'),
		).toBeVisible();
		await expect(
			screen.getByText('Delivery not confirmed for: US'),
		).toBeVisible();
		await expect(
			screen.getByText('Reference: push-partial-1234'),
		).toBeVisible();
		await expect(
			screen.queryByRole('button', { name: 'Try Again' }),
		).not.toBeInTheDocument();
	},
};

export const PastRecommendedStillSends: Story = {
	args: {
		notificationState: populatedPushState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const headline = canvas.getByLabelText('Headline');
		await userEvent.clear(headline);
		await userEvent.type(headline, 'a'.repeat(201));

		await expect(canvas.queryByText('Recommended')).not.toBeInTheDocument();
		await expect(canvas.getByText('Warning')).toBeVisible();
		await expect(
			canvas.getByText('90 characters or fewer preferred'),
		).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Send app alert' }),
		);

		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
	},
};

export const WithImportedArticle: Story = {
	args: {
		notificationState: populatedPushState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Article imported')).toBeVisible();
		await expect(canvas.getByLabelText('Headline')).toHaveValue(
			articleFixture.fields?.headline,
		);
	},
};

export const WithThumbnail: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: completePushParams,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumbnailToggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});
		await expect(thumbnailToggle).toBeEnabled();
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'true');
		await expect(
			canvas.getByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
		).toBeVisible();
	},
};

export const WithReplacementThumbnail: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: completePushParams,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const replacementThumbnailUrl =
			'https://media.guim.co.uk/replacement-thumbnail.jpg';
		const thumbnail = canvas.getByAltText(
			'Thumbnail for A rhyme to recall rising temperatures',
		);

		await expect(thumbnail).toHaveAttribute(
			'src',
			articleFixture.fields?.thumbnail,
		);

		await userEvent.click(
			canvas.getByRole('button', { name: 'Replace image' }),
		);
		const replacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		const updateButton = canvas.getByRole('button', { name: 'Update' });

		await userEvent.clear(replacementInput);
		await userEvent.type(replacementInput, replacementThumbnailUrl);
		await expect(thumbnail).toHaveAttribute(
			'src',
			articleFixture.fields?.thumbnail,
		);

		await userEvent.click(updateButton);

		await expect(thumbnail).toHaveAttribute(
			'src',
			articleFixture.fields?.thumbnail,
		);
		await expect(canvas.getByText('Image updated')).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Send app alert' }),
		);
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
	},
};

export const RejectsNonGuardianReplacementThumbnail: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: completePushParams,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await userEvent.click(
			canvas.getByRole('button', { name: 'Replace image' }),
		);
		await userEvent.type(
			canvas.getByRole('textbox', { name: 'replacement image URL' }),
			'https://example.com/replacement-thumbnail.jpg',
		);
		await userEvent.click(canvas.getByRole('button', { name: 'Update' }));

		await expect(
			canvas.getByText('Please enter a valid Guardian image URL'),
		).toBeVisible();
		await expect(canvas.queryByText('Image updated')).not.toBeInTheDocument();
	},
};

export const WithLiveblogMainBlockThumbnail: Story = {
	args: {
		notificationState: {
			...populatedPushState,
			fetchedArticleId: liveblogFixture.id,
			content: {
				...liveblogFixture,
				fields: {
					headline: liveblogFixture.fields?.headline ?? 'Latest developments',
					lastModified: liveblogFixture.fields?.lastModified ?? '',
				},
			},
		},
		formValues: {
			...completePushParams,
			headline: liveblogFixture.fields?.headline ?? 'Latest developments',
			articleThumbnailUrl: '',
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumbnailToggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(thumbnailToggle).toBeEnabled();
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'true');
		await expect(canvas.getByAltText('Latest liveblog update')).toHaveAttribute(
			'src',
			'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
		);
	},
};

export const WithThumbnailTurnedOff: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: { ...completePushParams, includeThumbnail: false },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumbnailToggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(thumbnailToggle).toBeEnabled();
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'false');
		await expect(
			canvas.getByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
		).toBeVisible();

		await userEvent.click(thumbnailToggle);

		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'true');
		await expect(
			canvas.getByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
		).toBeVisible();
	},
};

export const SubmitWithNativeForm: Story = {
	args: {
		notificationState: populatedPushState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const form = canvas.getByRole<HTMLFormElement>('form', {
			name: 'Create app alert',
		});
		await expect(form).toBeVisible();
		await expect(form).toHaveAttribute('method', 'post');
		await expect(form).toHaveAttribute('novalidate');
		form.requestSubmit();

		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
	},
};

export const Empty: Story = {
	args: {
		notificationState: {
			...defaultAppAlertState,
			isFetchingContent: false,
			confirmSendModalOpen: false,
			isWaitingForSend: false,
		},
	},
};

export const FetchingArticle: Story = {
	args: {
		notificationState: {
			...defaultAppAlertState,
			isFetchingContent: true,
		},
	},
};

export const FetchArticleError: Story = {
	args: {
		notificationState: {
			...defaultAppAlertState,
			isFetchingContent: false,
			fetchArticleError: 'Failed to fetch article',
		},
	},
};

export const NonGuardianArticleUrl: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(
			canvas.getByLabelText('article URL'),
			'https://www.example.com/world/2026/sep/08/article',
		);

		await expect(
			canvas.getByText('Paste a Guardian article URL beginning with https://.'),
		).toBeVisible();
	},
};

export const IncompleteGuardianArticleUrl: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(
			canvas.getByLabelText('article URL'),
			'https://www.theguardian.com/world',
		);

		await expect(
			canvas.getByText(
				'This Guardian link looks incomplete. Paste the full article URL.',
			),
		).toBeVisible();
	},
};
