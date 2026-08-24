import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
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

export const Empty: Story = {
	args: {
		notificationState: {
			isFetchingContent: false,
			confirmSendModalOpen: false,
			isWaitingForSend: false,
			hasAttemptedSend: false,
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
		);
	},
});

export const Unauthenticated: Story = buildErrorStory(unauthenticatedError);
export const BadRequest: Story = buildErrorStory(badRequestError);
export const InternalError: Story = buildErrorStory(internalError);
export const NoPermission: Story = buildErrorStory(noPermissionError);
export const UnparsableResponse: Story = buildErrorStory(jsonParseFailure);
export const FetchFailError: Story = buildErrorStory(fetchFailError);
