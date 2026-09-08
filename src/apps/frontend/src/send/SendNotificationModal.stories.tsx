import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../testing/capi-fixtures';
import {
	completeEmailParams,
	completePushParams,
	populatedEmailState,
	WithNotificationContext,
} from '../testing/story-helpers';
import type { ChannelOption, NotificationState } from '../types';
import {
	buildAppAlertRequest,
	buildNewsletterRequest,
} from '../utils/build-request-payloads';
import { defaultAppAlertState } from '../utils/notification-reducer';
import { SendNotificationModal } from './SendNotificationModal';

type StoryArgs = {
	notificationState: NotificationState;
	channel: ChannelOption;
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
		channel: 'email',
		notificationState: {
			...populatedEmailState,
			confirmSendModalOpen: true,
			pendingRequest: buildNewsletterRequest({
				values: completeEmailParams,
				content: articleFixture,
				idempotencyKey: 'storybook-newsletter',
			}),
		},
	},
	render: ({ channel, notificationState }: StoryArgs) =>
		WithNotificationContext(
			<SendNotificationModal />,
			notificationState,
			{},
			channel,
		),
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
		channel: 'push',
		notificationState: {
			...defaultAppAlertState,
			confirmSendModalOpen: true,
			pendingRequest: buildAppAlertRequest({
				values: completePushParams,
				alertTypeLabel: 'Breaking news',
				content: articleFixture,
				idempotencyKey: 'storybook-app-alert',
			}),
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
