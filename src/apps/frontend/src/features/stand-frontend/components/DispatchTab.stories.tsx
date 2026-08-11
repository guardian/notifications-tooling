import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { DispatchTab } from './DispatchTab';

type StoryArgs = {
	notificationState: NotificationState;
};

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/DispatchTab',
	component: DispatchTab,
	args: {
		notificationState: defaultState,
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Dispatch tab combining the notification creation form and preview with selected audience, channel, and delivery timing.',
			},
		},
	},
	render: (args) => {
		const { notificationState } = args;
		return WithNotificationContext(<DispatchTab />, notificationState);
	},
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('Create newsletter email'),
		).toBeInTheDocument();
		await expect(
			canvas.getByText(
				'The preview for the newsletter email and/or the app alert notification will be shown below.',
			),
		).toBeInTheDocument();
	},
};
