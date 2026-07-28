import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
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

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Create a Notification')).toBeInTheDocument();
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
		notificationState: {
			...defaultState,
			articleInputText: articleFixture.webUrl,
			content: articleFixture,
			fetchedArticleId: articleFixture.id,
			parameters: completeEmailParams,
		},
	},
};

export const ConfirmationStep: Story = {
	args: {
		notificationState: {
			...defaultState,
			articleInputText: articleFixture.webUrl,
			content: articleFixture,
			fetchedArticleId: articleFixture.webUrl,
			parameters: completeEmailParams,
			confirmSendModalOpen: true,
		},
	},
};

export const SendingEmail: Story = {
	args: {
		notificationState: {
			...defaultState,
			articleInputText: articleFixture.webUrl,
			content: articleFixture,
			fetchedArticleId: articleFixture.webUrl,
			parameters: completeEmailParams,
			confirmSendModalOpen: true,
			isWaitingForSend: true,
		},
	},
};
