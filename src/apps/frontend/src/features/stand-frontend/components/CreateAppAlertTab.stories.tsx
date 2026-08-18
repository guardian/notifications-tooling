import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { defaultAppAlertState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { CreateAppAlertTab } from './CreateAppAlertTab';

type StoryArgs = {
	notificationState: NotificationState;
};

const meta = {
	title: 'Stand Frontend/CreateAppAlertTab',
	component: CreateAppAlertTab,
	args: {
		notificationState: defaultAppAlertState,
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'App alert creation tab combining the notification form and preview with selected channel,alert type, editions  and delivery timing.',
			},
		},
	},
	render: (args: StoryArgs) => {
		const { notificationState } = args;
		return (
			<div
				style={{
					display: 'flex',
					minWidth: '1600px',
					minHeight: '100vh',
					boxSizing: 'border-box',
				}}
			>
				{WithNotificationContext(<CreateAppAlertTab />, notificationState)}
			</div>
		);
	},
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Create app alert' }),
		).toBeInTheDocument();
	},
};
