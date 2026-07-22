import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { parseHtml } from '../../../util/html-helpers';
import { defaultState } from '../notification-reducer';
import type { EmailNotification, NotificationState } from '../types';
import { CreateNotificationForm } from './CreateNotificationForm';

type StoryArgs = { notificationState: NotificationState };
type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/CreateNotificationForm',
	component: CreateNotificationForm,
	parameters: {
		docs: {
			description: {
				component:
					'This is a non-functional placeholder to demonstrate how content will appear in the layout.',
			},
		},
	},
	args: {
		notificationState: defaultState,
	},
	render: (args) => {
		return WithNotificationContext(
			<CreateNotificationForm />,
			args.notificationState,
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

const completeEmailParamer: EmailNotification = {
	type: 'email',
	kicker: 'exclusive',
	subject: articleFixture.fields?.headline,
	preview: parseHtml(articleFixture.fields?.standfirst).textContent,
	emailDeliveryOption: 'immediate',
	audienceSegments: ['AU', 'UK'],
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
			articleId: articleFixture.webUrl,
			content: articleFixture,
			fetchedArticleId: articleFixture.webUrl,
			parameters: completeEmailParamer,
		},
	},
};

export const ConfirmationStep: Story = {
	args: {
		notificationState: {
			...defaultState,
			articleId: articleFixture.webUrl,
			content: articleFixture,
			fetchedArticleId: articleFixture.webUrl,
			parameters: completeEmailParamer,
			confirmSendModalOpen: true,
		},
	},
};

export const SendingEmail: Story = {
	args: {
		notificationState: {
			...defaultState,
			articleId: articleFixture.webUrl,
			content: articleFixture,
			fetchedArticleId: articleFixture.webUrl,
			parameters: completeEmailParamer,
			confirmSendModalOpen: true,
			isWaitingForSend: true,
		},
	},
};
