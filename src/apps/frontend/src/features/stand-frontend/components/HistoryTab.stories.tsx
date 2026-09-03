import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { type HistoryNotification, HistoryTab } from './HistoryTab';

const notifications: HistoryNotification[] = [
	{
		id: '2df4fb5d-6a52-46e8-a88e-81e4f990d642',
		title:
			'Prime minister announces cabinet reshuffle after a long day of meetings with senior ministers',
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
	args: { notifications },
	globals: { viewport: { value: '1280px-900px', isRotated: false } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('grid', { name: 'Sent alerts' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', {
				name: /Prime minister announces cabinet reshuffle/,
			}),
		).toBeInTheDocument();
		const sentBadge = canvas.getByText('Sent');
		await expect(sentBadge).toBeInTheDocument();
		await expect(canvas.getByText('Partially sent')).toBeInTheDocument();
		const noImageLabel = canvas.getByText('No image');
		await expect(noImageLabel).toBeInTheDocument();
		await expect(canvasElement.querySelectorAll('img')).toHaveLength(1);
		await expect(
			canvas.getByRole('img', { name: 'International' }),
		).toBeInTheDocument();
		await expect(
			canvas.getAllByRole('img', { name: 'Australia' }),
		).toHaveLength(2);
	},
};

export const Mobile: Story = {
	args: { notifications },
	globals: { viewport: { value: '393px-852px', isRotated: false } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const title = canvas.getByRole('link', {
			name: /Prime minister announces cabinet reshuffle/,
		});

		await expect(title).toBeVisible();
		await expect(canvas.getByText('Sent')).toBeVisible();
		await expect(
			canvas.getAllByRole('img', { name: 'Australia' })[0],
		).toBeVisible();
	},
};

export const MidSize: Story = {
	args: { notifications },
	globals: { viewport: { value: '829px-900px', isRotated: false } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText('alex@example.com')).toBeVisible();
		await expect(canvas.getByText('Sent')).toBeVisible();
	},
};

export const FailedStatus: Story = {
	args: { notifications: [{ ...notifications[0]!, status: 'Failed' }] },
	globals: { viewport: { value: '393px-852px', isRotated: false } },
	play: async ({ canvasElement }) => {
		const failedBadge = within(canvasElement).getByText('Failed');

		await expect(failedBadge).toBeVisible();
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
