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
import { articleFixture } from '../../../mocks/capi-fixtures';
import { mockSendRejectedNotification } from '../../../mocks/mock-send-notification';
import {
	completeEmailParams,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { CreateNotificationForm } from './CreateNotificationForm';

type StoryArgs = {
	notificationState: NotificationState;
};
type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/CreateNotificationForm',
	component: CreateNotificationForm,
	args: {
		notificationState: defaultState,
	},
	render: (args) => {
		const { notificationState } = args;
		return WithNotificationContext(
			<CreateNotificationForm />,
			notificationState,
		);
	},
};

export default meta;

const populatedEmailState = {
	...defaultState,
	articleInputText: articleFixture.webUrl,
	content: articleFixture,
	fetchedArticleId: articleFixture.id,
	parameters: completeEmailParams,
};

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
		const { notificationState } = args;
		return WithNotificationContext(
			<CreateNotificationForm />,
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
