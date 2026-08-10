import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import {
	mockSendFailingRequest,
	mockSendRejectedNotification,
} from '../../../mocks/mock-send-notification';
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

export const MobilePreview: Story = {
	args: {
		notificationState: populatedEmailState,
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile2',
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Preview' });

		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(
			canvas.getByText(
				'The preview for the newsletter email and/or the app alert notification will be shown below.',
			),
		).toBeInTheDocument();

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
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

export const SendEmailFail: Story = {
	args: {
		notificationState: {
			...populatedEmailState,
			isWaitingForSend: false,
			sendingResult: {
				ok: false,
				requestFailed: true,
			},
		},
	},
	render: (args) => {
		const { notificationState } = args;
		return WithNotificationContext(
			<CreateNotificationForm />,
			notificationState,
			{
				sendNotification: mockSendFailingRequest,
			},
		);
	},
};

export const SendEmailRejected: Story = {
	args: {
		notificationState: {
			...populatedEmailState,
			isWaitingForSend: false,
			sendingResult: {
				ok: false,
				response: {
					error: 'unauthenticated',
					message: 'Authentication is required to access this resource.',
				},
			},
		},
	},
	render: (args) => {
		const { notificationState } = args;
		return WithNotificationContext(
			<CreateNotificationForm />,
			notificationState,
			{
				sendNotification: mockSendRejectedNotification,
			},
		);
	},
};
