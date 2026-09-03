import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { type HistoryAlert, HistoryView } from './HistoryView';

const alerts: HistoryAlert[] = [
	{
		id: '2df4fb5d-6a52-46e8-a88e-81e4f990d642',
		title: 'Prime minister announces cabinet reshuffle',
		href: 'https://www.theguardian.com/politics',
		thumbnailUrl: articleFixture.fields?.thumbnail,
		channel: 'push',
		alertType: 'Breaking news',
		sentBy: 'alex@example.com',
		sentTo: ['US', 'AU'],
		sentAt: new Date(Date.now() - 5 * 60_000).toISOString(),
		status: 'Sent',
	},
	{
		id: 'cbca4dac-45a6-4eba-93ef-ed0975ac9c8d',
		title: 'Breaking: major rail disruption across south-east England',
		href: 'https://www.theguardian.com/uk-news',
		channel: 'email',
		alertType: 'Breaking news',
		sentBy: 'jamie@example.com',
		sentTo: ['US', 'UK', 'AU', 'INT', 'EU'],
		sentAt: '2026-08-11T15:34:00Z',
		status: 'Partially sent',
	},
];

const paginatedAlerts: HistoryAlert[] = Array.from(
	{ length: 80 },
	(_, index) => {
		const alert = alerts[index % alerts.length]!;

		return {
			...alert,
			id: `${alert.id}-${index + 1}`,
			href: `${alert.href}?story=${index + 1}`,
			title: `${alert.title} (${index + 1})`,
		};
	},
);

const meta = {
	title: 'Stand Frontend/HistoryView',
	component: HistoryView,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof HistoryView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		alerts,
		totalItems: alerts.length,
		currentPage: 1,
		limit: 10,
		handlePageChange: () => undefined,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('grid', { name: 'Sent alerts' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', {
				name: 'Prime minister announces cabinet reshuffle',
			}),
		).toBeInTheDocument();
		await expect(canvas.getByText('Sent')).toBeInTheDocument();
		await expect(canvas.getByText('Partially sent')).toBeInTheDocument();
		await expect(canvas.getByText('No image')).toBeInTheDocument();
		await expect(canvasElement.querySelectorAll('img')).toHaveLength(1);
		await expect(
			canvas.getByRole('img', { name: 'International' }),
		).toBeInTheDocument();
	},
};

export const Empty: Story = {
	args: {
		alerts: [],
		totalItems: 0,
		currentPage: 1,
		limit: 10,
		handlePageChange: () => undefined,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('No alerts have been sent yet.'),
		).toBeInTheDocument();
	},
};

export const Loading: Story = {
	args: {
		alerts: [],
		totalItems: 0,
		currentPage: 1,
		limit: 10,
		isLoading: true,
		handlePageChange: () => undefined,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Loading history...')).toBeInTheDocument();
		await expect(
			canvas.queryByRole('grid', { name: 'Sent alerts' }),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByRole('navigation', { name: 'Pagination' }),
		).not.toBeInTheDocument();
	},
};

export const Error: Story = {
	args: {
		alerts: [],
		totalItems: 0,
		currentPage: 1,
		limit: 10,
		error: 'Unable to load notification history. Try again.',
		handlePageChange: () => undefined,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('Unable to load notification history. Try again.'),
		).toBeInTheDocument();
		await expect(
			canvas.queryByRole('grid', { name: 'Sent alerts' }),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByRole('navigation', { name: 'Pagination' }),
		).not.toBeInTheDocument();
	},
};

export const WithPagination: Story = {
	args: {
		alerts: paginatedAlerts.slice(0, 10),
		totalItems: paginatedAlerts.length,
		limit: 10,
		currentPage: 1,
		handlePageChange: () => undefined,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('navigation', { name: 'Pagination' }),
		).toBeInTheDocument();
		await expect(canvas.getByText('Results: 1–10 of 80')).toBeInTheDocument();
		await expect(
			canvas.getByRole('button', { name: 'Go to page 2' }),
		).toBeInTheDocument();
		await expect(canvas.getByText('…')).toBeInTheDocument();
	},
};
