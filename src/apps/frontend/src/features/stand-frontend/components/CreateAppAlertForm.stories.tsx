import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import {
	populatedPushState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { defaultAppAlertState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { CreateAppAlertForm } from './CreateAppAlertForm';

type StoryArgs = {
	notificationState: NotificationState;
	activeSectionHref: string;
};
type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/CreateAppAlertForm',
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
		activeSectionHref: '#article-section',
	},
	render: (args) => {
		const { activeSectionHref, notificationState } = args;
		return WithNotificationContext(
			<CreateAppAlertForm activeSectionHref={activeSectionHref} />,
			notificationState,
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
