import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { type HistoryAlert, HistoryTab } from './HistoryTab';

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
	title: 'Stand Frontend/HistoryTab',
	component: HistoryTab,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof HistoryTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { alerts },
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('No alerts have been sent yet.'),
		).toBeInTheDocument();
	},
};

export const WithPagination: Story = {
	args: { alerts: paginatedAlerts },
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
