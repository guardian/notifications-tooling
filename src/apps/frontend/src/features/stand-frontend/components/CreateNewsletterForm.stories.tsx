import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { ApiError } from '../../../api/errors';
import {
	badRequestError,
	fetchFailError,
	internalError,
	jsonParseFailure,
	noPermissionError,
	unauthenticatedError,
} from '../../../mocks/api-fixtures';
import { mockSendRejectedNotification } from '../../../mocks/mock-send-notification';
import {
	completeEmailParams,
	populatedEmailState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { CreateNewsletterForm } from './CreateNewsletterForm';

type StoryArgs = {
	notificationState: NotificationState;
	activeSectionHref: string;
};
type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/CreateNewsletterForm',
	component: CreateNewsletterForm,
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
		notificationState: defaultState,
		activeSectionHref: '#article-section',
	},
	render: (args) => {
		const { activeSectionHref, notificationState } = args;
		return WithNotificationContext(
			<CreateNewsletterForm activeSectionHref={activeSectionHref} />,
			notificationState,
			{},
			'email',
			notificationState.content ? completeEmailParams : undefined,
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
		await expect(canvas.getByText('Subject')).toBeInTheDocument();
		await expect(canvas.getByText('Preview text')).toBeInTheDocument();
	},
};

export const ValidationErrors: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole('button', { name: 'Send newsletter email' }),
		);

		await expect(canvas.getByText('Subject is required')).toBeVisible();
		await expect(canvas.getByText('Preview text is required')).toBeVisible();
		await expect(
			canvas.getByText('Please select an audience segment'),
		).toBeVisible();
		await expect(
			canvas.getByText('Paste a URL to fetch an article'),
		).toBeVisible();
	},
};

export const HardLimitBlocksSend: Story = {
	args: {
		notificationState: populatedEmailState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const subject = canvas.getByLabelText('Subject');
		await userEvent.clear(subject);
		await userEvent.type(subject, 'a'.repeat(60));
		await userEvent.click(
			canvas.getByRole('button', { name: 'Send newsletter email' }),
		);

		await expect(
			canvas.getByText(
				'Subject must be 70 characters or fewer including the kicker',
			),
		).toBeVisible();
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			screen.queryByText('Are you sure you want to send the newsletter email?'),
		).not.toBeInTheDocument();
	},
};

export const Empty: Story = {
	args: {
		notificationState: {
			isFetchingContent: false,
			confirmSendModalOpen: false,
			isWaitingForSend: false,
		},
	},
};

export const FetchingArticle: Story = {
	args: {
		notificationState: {
			...defaultState,
			isFetchingContent: true,
		},
	},
};

export const FetchArticleError: Story = {
	args: {
		notificationState: {
			...defaultState,
			isFetchingContent: false,
			fetchArticleError: 'Failed to fetch article',
		},
	},
};

export const PopulatedEmail: Story = {
	args: {
		notificationState: populatedEmailState,
	},
};

export const SubmitWithNativeForm: Story = {
	args: {
		notificationState: populatedEmailState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const form = canvas.getByRole<HTMLFormElement>('form', {
			name: 'Create newsletter email',
		});
		await expect(form).toBeVisible();
		form.requestSubmit();

		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText(
				'Are you sure you want to send the newsletter email?',
			),
		).toBeVisible();
	},
};

export const ConfirmationStep: Story = {
	args: {
		notificationState: {
			...populatedEmailState,
			confirmSendModalOpen: true,
		},
	},
};

export const SendingEmail: Story = {
	args: {
		notificationState: {
			...populatedEmailState,
			confirmSendModalOpen: true,
			isWaitingForSend: true,
		},
	},
};

const buildErrorStory = (error: ApiError): Story => ({
	args: {
		notificationState: {
			...populatedEmailState,
			isWaitingForSend: false,
			sendingResult: {
				ok: false,
				response: error,
			},
		},
	},
	render: (args) => {
		const { activeSectionHref, notificationState } = args;
		return WithNotificationContext(
			<CreateNewsletterForm activeSectionHref={activeSectionHref} />,
			notificationState,
			{
				sendNotification: mockSendRejectedNotification(error),
			},
			'email',
			completeEmailParams,
		);
	},
});

export const Unauthenticated: Story = buildErrorStory(unauthenticatedError);
export const BadRequest: Story = buildErrorStory(badRequestError);
export const InternalError: Story = buildErrorStory(internalError);
export const NoPermission: Story = buildErrorStory(noPermissionError);
export const UnparsableResponse: Story = buildErrorStory(jsonParseFailure);
export const FetchFailError: Story = buildErrorStory(fetchFailError);
