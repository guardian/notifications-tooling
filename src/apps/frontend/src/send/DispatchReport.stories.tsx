import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
	completeEmailParams,
	completePushParams,
	WithNotificationContext,
} from '../testing/story-helpers';
import type { ChannelOption, NotificationState } from '../types';
import { defaultState } from '../utils/notification-reducer';
import {
	AppAlertDispatchDetails,
	AppAlertDispatchReportTab,
	DispatchReport,
	NewsletterDispatchDetails,
	NewsletterDispatchReportTab,
} from './DispatchReport';

type StoryArgs = {
	notificationState: NotificationState;
	channel: ChannelOption;
	onStartNew: () => void;
};
type Story = StoryObj<StoryArgs>;

const DispatchReportStory = ({
	notificationState,
	channel,
	onStartNew,
}: StoryArgs) =>
	WithNotificationContext(
		<DispatchReport channel={channel} onCreateNew={onStartNew}>
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
		onStartNew: fn(),
		notificationState: defaultState,
	},
};

export default meta;

export const EmailSuccess: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			canvas.getByRole('heading', { name: 'Newsletter email sent' }),
		).toBeVisible();
		await expect(
			canvas.getByText(`Exclusive: ${completeEmailParams.subject}`),
		).toBeVisible();
		await expect(canvas.getByText('Newsletter email')).toBeVisible();
		await expect(canvas.getByText('United Kingdom')).toBeVisible();
		await expect(canvas.getByText('Australia')).toBeVisible();
		await expect(canvas.getByText('Immediate send')).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Create new newsletter email' }),
		);
		await expect(args.onStartNew).toHaveBeenCalledOnce();
	},
};

export const AppAlertSuccess: Story = {
	args: {
		channel: 'push',
		onStartNew: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			canvas.getByRole('heading', { name: 'App alert sent' }),
		).toBeVisible();
		await expect(
			canvas.getByText(`Breaking news: ${completePushParams.headline}`),
		).toBeVisible();
		await expect(canvas.getByText('App alert')).toBeVisible();
		await expect(canvas.getByText('United Kingdom')).toBeVisible();
		await expect(canvas.getByText('International')).toBeVisible();
		await expect(canvas.getByText('Immediate send')).toBeVisible();
		await expect(
			canvas.getByText('Show article thumbnail image'),
		).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Create new app alert' }),
		);
		await expect(args.onStartNew).toHaveBeenCalledOnce();
	},
};

export const NewsletterReportRoute: Story = {
	render: () =>
		WithNotificationContext(
			<NewsletterDispatchReportTab />,
			defaultState,
			{},
			'email',
			{ ...completeEmailParams, dispatchId: 'newsletter-dispatch-id' },
		),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Newsletter email sent' }),
		).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Create new newsletter email' }),
		);
		await waitFor(() =>
			expect(
				canvas.queryByRole('heading', { name: 'Newsletter email sent' }),
			).not.toBeInTheDocument(),
		);
	},
};

export const AppAlertReportRoute: Story = {
	render: () =>
		WithNotificationContext(
			<AppAlertDispatchReportTab />,
			defaultState,
			{},
			'push',
			{ ...completePushParams, dispatchId: 'app-alert-dispatch-id' },
		),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'App alert sent' }),
		).toBeVisible();
	},
};

export const ReportRouteRequiresSuccessfulDispatch: Story = {
	render: () =>
		WithNotificationContext(
			<NewsletterDispatchReportTab />,
			defaultState,
			{},
			'email',
			completeEmailParams,
		),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.queryByRole('heading', { name: 'Newsletter email sent' }),
		).not.toBeInTheDocument();
	},
};
