import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
	populatedEmailState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { defaultAppAlertState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { SendNotificationModal } from './SendNotificationModal';

type StoryArgs = {
	notificationState: NotificationState;
};

const meta = {
	title: 'Stand Frontend/SendNotificationModal',
	component: SendNotificationModal,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The send confirmation shown before a notification is sent. Shared by both channels, taking its wording from the selected channel.',
			},
		},
	},
	args: {
		notificationState: {
			...populatedEmailState,
			confirmSendModalOpen: true,
		},
	},
	render: (args: StoryArgs) =>
		WithNotificationContext(<SendNotificationModal />, args.notificationState),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewsletterEmail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement.ownerDocument.body);
		await expect(
			canvas.getByText('Are you sure you want to send the newsletter email?'),
		).toBeVisible();
		await expect(
			canvas.getByText('Sent newsletter emails cannot be undone'),
		).toBeVisible();
		await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeVisible();
		await expect(
			canvas.getByRole('button', { name: 'Confirm send' }),
		).toBeVisible();
	},
};

export const AppAlert: Story = {
	args: {
		notificationState: {
			...defaultAppAlertState,
			confirmSendModalOpen: true,
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement.ownerDocument.body);
		await expect(
			canvas.getByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
		await expect(
			canvas.getByText('Sent app alerts cannot be undone'),
		).toBeVisible();
		await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeVisible();
		await expect(
			canvas.getByRole('button', { name: 'Confirm send' }),
		).toBeVisible();
	},
};
