import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
	completeEmailParams,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { FALLBACK_TOPIC_TYPES } from '../api/useChannelAudiences';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { AppPreviewToggle, EmailPreviewToggle } from './PreviewToggle';

type StoryArgs = {
	notificationState: NotificationState;
};

type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/PreviewToggle',
	component: EmailPreviewToggle,
	args: {
		notificationState: defaultState,
	},
	render: ({ notificationState }) =>
		WithNotificationContext(<EmailPreviewToggle />, notificationState),
};

export default meta;

export const Collapsed: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('button', { name: 'Preview' }),
		).toHaveAttribute('aria-expanded', 'false');
	},
};

export const Expanded: Story = {
	args: {
		notificationState: {
			...defaultState,
			parameters: completeEmailParams,
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Preview' });

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(
			canvas.getByText(
				'The preview for the newsletter email and/or the app alert notification will be shown below.',
			),
		).toBeInTheDocument();
	},
};

export const AppExpanded: Story = {
	render: ({ notificationState }) =>
		WithNotificationContext(
			<AppPreviewToggle
				selectedTopics={[
					{ type: 'breaking-news', name: 'uk' },
					{ type: 'breaking-news', name: 'international' },
				]}
				topicTypes={FALLBACK_TOPIC_TYPES}
			/>,
			notificationState,
		),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Preview' });

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(
			canvas.getByText('The preview for the app alert will be shown below.'),
		).toBeInTheDocument();
	},
};
