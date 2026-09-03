import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
	completeEmailParams,
	completePushParams,
	populatedPushState,
	WithNotificationContext,
} from '../testing/story-helpers';
import { FALLBACK_TOPIC_TYPES } from '../segment/audience-fallbacks';
import type { NotificationState } from '../types';
import { defaultState } from '../utils/notification-reducer';
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
		},
	},
	render: ({ notificationState }) =>
		WithNotificationContext(
			<EmailPreviewToggle />,
			notificationState,
			{},
			'email',
			completeEmailParams,
		),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Preview' });

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(
			canvas.getByText(
				'The preview for the newsletter email will be shown below.',
			),
		).toBeInTheDocument();
	},
};

export const AppExpanded: Story = {
	args: {
		notificationState: populatedPushState,
	},
	render: ({ notificationState }) =>
		WithNotificationContext(
			<AppPreviewToggle topicTypes={FALLBACK_TOPIC_TYPES} />,
			notificationState,
			{},
			'push',
			completePushParams,
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
