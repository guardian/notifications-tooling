import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../testing/capi-fixtures';
import {
	completeAppAlertFormValues,
	completeNewsletterEmailFormValues,
	populatedNewsletterEmailComposerState,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { ChannelOption, NotificationComposerState } from '../types';
import {
	buildAppAlertRequest,
	buildNewsletterEmailRequest,
} from '../utils/build-request-payloads';
import { defaultAppAlertComposerState } from '../utils/notification-composer-reducer';
import { SendConfirmationModal } from './SendConfirmationModal';

type StoryArgs = {
	formId: string;
	composerState: NotificationComposerState;
	channel: ChannelOption;
};

const meta = {
	title: 'Dispatch/Send/SendConfirmationModal',
	component: SendConfirmationModal,
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
		formId: 'notification-form',
		channel: 'newsletter',
		composerState: {
			...populatedNewsletterEmailComposerState,
			isSendConfirmationOpen: true,
			pendingRequest: buildNewsletterEmailRequest({
				values: completeNewsletterEmailFormValues,
				article: articleFixture,
				idempotencyKey: 'storybook-newsletter',
			}),
		},
	},
	render: function Render({ formId, channel, composerState }: StoryArgs) {
		return useNotificationFormStory(
			<SendConfirmationModal formId={formId} />,
			composerState,
			{},
			channel,
		);
	},
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
			canvas.getByText('Sent newsletter emails cannot be undone.'),
		).toBeVisible();
		await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeVisible();
		const confirmSend = canvas.getByRole('button', { name: 'Confirm send' });
		await expect(confirmSend).toBeVisible();
		await expect(confirmSend).toHaveAttribute('type', 'submit');
		await expect(confirmSend).toHaveAttribute('form', 'notification-form');
	},
};

export const AppAlert: Story = {
	args: {
		channel: 'app-push',
		composerState: {
			...defaultAppAlertComposerState,
			isSendConfirmationOpen: true,
			pendingRequest: buildAppAlertRequest({
				values: completeAppAlertFormValues,
				alertTypeLabel: 'Breaking news',
				article: articleFixture,
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
			canvas.getByText('Sent app alerts cannot be undone.'),
		).toBeVisible();
		await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeVisible();
		const confirmSend = canvas.getByRole('button', { name: 'Confirm send' });
		await expect(confirmSend).toBeVisible();
		await expect(confirmSend).toHaveAttribute('type', 'submit');
		await expect(confirmSend).toHaveAttribute('form', 'notification-form');
	},
};
