import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
	completeAppAlertFormValues,
	completeNewsletterEmailFormValues,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { ChannelOption, NotificationComposerState } from '../types';
import { defaultComposerState } from '../utils/notification-composer-reducer';
import {
	AppAlertDispatchDetails,
	AppAlertDispatchReportTab,
	DispatchReport,
	NewsletterEmailDispatchDetails,
	NewsletterEmailDispatchReportTab,
} from './DispatchReport';

type StoryArgs = {
	composerState: NotificationComposerState;
	channel: ChannelOption;
	onStartNew: () => void;
};
type Story = StoryObj<StoryArgs>;

const DispatchReportStory = ({
	composerState,
	channel,
	onStartNew,
}: StoryArgs) =>
	useNotificationFormStory(
		<DispatchReport channel={channel} onCreateNew={onStartNew}>
			{channel === 'newsletter' ? (
				<NewsletterEmailDispatchDetails />
			) : (
				<AppAlertDispatchDetails />
			)}
		</DispatchReport>,
		composerState,
		{},
		channel,
		channel === 'newsletter'
			? completeNewsletterEmailFormValues
			: completeAppAlertFormValues,
	);

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Send/DispatchReport',
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
		channel: 'newsletter',
		onStartNew: fn(),
		composerState: defaultComposerState,
	},
};

export default meta;

export const NewsletterEmailSuccess: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			canvas.getByRole('heading', { name: 'Newsletter email sent' }),
		).toBeVisible();
		await expect(
			canvas.getByText(
				`Exclusive: ${completeNewsletterEmailFormValues.subjectText}`,
			),
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
		channel: 'app-push',
		onStartNew: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			canvas.getByRole('heading', { name: 'App alert sent' }),
		).toBeVisible();
		await expect(
			canvas.getByText(`Breaking news: ${completeAppAlertFormValues.headline}`),
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

export const NewsletterEmailReportRoute: Story = {
	render: function Render() {
		return useNotificationFormStory(
			<NewsletterEmailDispatchReportTab />,
			defaultComposerState,
			{},
			'newsletter',
			{
				...completeNewsletterEmailFormValues,
				notificationId: 'newsletter-dispatch-id',
			},
		);
	},
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
	render: function Render() {
		return useNotificationFormStory(
			<AppAlertDispatchReportTab />,
			defaultComposerState,
			{},
			'app-push',
			{
				...completeAppAlertFormValues,
				notificationId: 'app-alert-dispatch-id',
			},
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'App alert sent' }),
		).toBeVisible();
	},
};

export const ReportRouteRequiresNotificationId: Story = {
	render: function Render() {
		return useNotificationFormStory(
			<NewsletterEmailDispatchReportTab />,
			defaultComposerState,
			{},
			'newsletter',
			completeNewsletterEmailFormValues,
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.queryByRole('heading', { name: 'Newsletter email sent' }),
		).not.toBeInTheDocument();
	},
};
