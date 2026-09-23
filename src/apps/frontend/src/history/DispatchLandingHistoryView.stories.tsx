import { InlineMessage } from '@guardian/stand/InlineMessage';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DispatchLandingHistoryView } from './DispatchLandingHistoryView';
import type { HistoryNotification } from './HistoryView';

const notifications: HistoryNotification[] = [
	{
		id: 'newsletter-1',
		title: 'Morning briefing',
		href: 'https://www.theguardian.com/world/example',
		channel: 'newsletter',
		alertType: 'Newsletter',
		sentBy: 'alex.editor@guardian.co.uk',
		sentTo: ['UK'],
		sentAt: '2026-09-21T08:30:00.000Z',
		status: 'Sent',
	},
	{
		id: 'app-alert-1',
		title: 'Breaking news update',
		href: 'https://www.theguardian.com/uk-news/example',
		channel: 'app-push',
		alertType: 'Breaking news',
		sentBy: 'jamie.editor@guardian.co.uk',
		sentTo: ['UK', 'INT'],
		sentAt: '2026-09-21T09:15:00.000Z',
		status: 'Sent',
	},
];

const meta = {
	title: 'Dispatch/History/DispatchLandingHistoryView',
	component: DispatchLandingHistoryView,
	parameters: { layout: 'fullscreen' },
	args: {
		notifications,
		lastUpdatedAt: '2026-09-21T09:30:00.000Z',
		onRefresh: fn(),
	},
} satisfies Meta<typeof DispatchLandingHistoryView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const activitySummary = canvas.getByRole('group', {
			name: 'Activity summary',
		});
		await expect(activitySummary).toHaveTextContent('Newsletter email 1');
		await expect(activitySummary).toHaveTextContent('App alert 1');
		await expect(
			canvas.getByRole('grid', { name: 'Sent alerts' }),
		).toBeVisible();
		await userEvent.click(
			canvas.getByRole('button', { name: 'Refresh activity' }),
		);
		await expect(args.onRefresh).toHaveBeenCalledOnce();
	},
};

export const Empty: Story = {
	args: { notifications: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'No alerts yet' }),
		).toBeVisible();
	},
};

export const Loading: Story = {
	args: { isLoading: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('status', { name: 'Loading alert history' }),
		).toBeVisible();
		await expect(
			canvas.queryByRole('button', { name: 'Refresh activity' }),
		).not.toBeInTheDocument();
	},
};

export const Error: Story = {
	args: {
		error: (
			<InlineMessage level="error">Unable to load activity.</InlineMessage>
		),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Unable to load activity.')).toBeVisible();
		await expect(
			canvas.queryByRole('button', { name: 'Refresh activity' }),
		).not.toBeInTheDocument();
	},
};
