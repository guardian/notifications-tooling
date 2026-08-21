import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { acceptedEmailSendResponse } from '../../../mocks/api-fixtures';
import {
	completeEmailParams,
	completePushParams,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import type { ChannelOption, NotificationState } from '../types';
import {
	AppAlertDispatchDetails,
	DispatchReport,
	NewsletterDispatchDetails,
} from './DispatchReport';

type StoryArgs = {
	notificationState: NotificationState;
	channel: ChannelOption;
	onResetNotification: () => void;
};
type Story = StoryObj<StoryArgs>;

const DispatchReportStory = ({
	notificationState,
	channel,
	onResetNotification,
}: StoryArgs) =>
	WithNotificationContext(
		<DispatchReport onResetNotification={onResetNotification}>
			{channel === 'email' ? (
				<NewsletterDispatchDetails />
			) : (
				<AppAlertDispatchDetails />
			)}
		</DispatchReport>,
		notificationState,
		{},
		channel,
		channel === 'email' ? completeEmailParams : completePushParams,
	);

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/DispatchReport',
	component: DispatchReportStory,
	parameters: {
		docs: {
			description: {
				component:
					'The successful dispatch summary for newsletter email and app-alert notifications.',
			},
		},
	},
	args: {
		channel: 'email',
		onResetNotification: fn(),
		notificationState: {
			...defaultState,
			sendingResult: {
				ok: true,
				response: acceptedEmailSendResponse,
			},
		},
	},
};

export default meta;

export const EmailSuccess: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByRole('heading', { name: 'Newsletter email sent' })).toBeVisible();
		await expect(canvas.getByText('Newsletter email')).toBeVisible();
		await expect(canvas.getByText('United Kingdom')).toBeVisible();
		await expect(canvas.getByText('Australia')).toBeVisible();
		await expect(canvas.getByText('Immediate send')).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Create new newsletter email' }),
		);
		await expect(args.onResetNotification).toHaveBeenCalledOnce();
	},
};

export const AppAlertSuccess: Story = {
	args: {
		channel: 'push',
		onResetNotification: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByRole('heading', { name: 'App alert sent' })).toBeVisible();
		await expect(canvas.getByText('App alert')).toBeVisible();
		await expect(canvas.getByText('UK, INT')).toBeVisible();
		await expect(canvas.getByText('Immediate send')).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Create new app alert' }),
		);
		await expect(args.onResetNotification).toHaveBeenCalledOnce();
	},
};

export const HiddenWithoutSuccessfulResult: Story = {
	args: {
		notificationState: defaultState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.queryByText('Details')).not.toBeInTheDocument();
	},
};
