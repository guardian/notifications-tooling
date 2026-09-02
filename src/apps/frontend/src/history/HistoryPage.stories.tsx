import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { getApiBaseUrl } from '../../../api/config';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { channelAudiencesHandler } from '../../../mocks/handlers/channels';
import type { NotificationListResponse } from '../api/schemas';
import { HistoryPage } from './HistoryPage';

const historyResponse: NotificationListResponse = {
	total: 4,
	limit: 20,
	offset: 0,
	notifications: [
		{
			id: '2df4fb5d-6a52-46e8-a88e-81e4f990d642',
			idempotencyKey: 'storybook-history-app-alert',
			kind: 'send',
			status: 'delivered',
			sender: 'notifications-tooling-spa/v1',
			createdByEmail: 'alex@example.com',
			dryRun: false,
			scheduledFor: null,
			content: {
				items: {
					'lead-story': {
						type: 'app-push',
						title: 'Breaking News',
						body: 'Prime minister announces cabinet reshuffle',
						link: 'https://www.theguardian.com/politics',
						media: {
							type: 'image',
							imageUrl: articleFixture.fields?.thumbnail,
							thumbnailUrl: articleFixture.fields?.thumbnail,
						},
					},
				},
			},
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [
							{ type: 'breaking-news', name: 'uk' },
							{ type: 'breaking-news', name: 'au' },
						],
					},
					compose: { use: 'lead-story' },
				},
			},
			createdAt: '2026-08-28T12:00:00.000Z',
			updatedAt: '2026-08-28T12:00:01.000Z',
		},
		{
			id: '47fe2f04-e7f6-4ea7-a03d-1b71bc70f27d',
			idempotencyKey: 'storybook-history-newsletter',
			kind: 'send',
			status: 'partially_delivered',
			sender: 'editorial-newsletters',
			createdByEmail: 'jamie@example.com',
			dryRun: false,
			scheduledFor: null,
			content: {
				items: {
					'lead-story': {
						type: 'newsletter',
						title: 'Extreme weather disrupts travel across Europe',
						body: 'Latest updates from correspondents across the region',
						link: 'https://www.theguardian.com/world/europe-news',
					},
				},
			},
			channels: {
				newsletter: {
					audience: {
						type: 'email',
						items: ['newsletter@example.com'],
					},
					variants: ['AU', 'US'],
					compose: {
						items: ['lead-story'],
						subject: 'Exclusive: Extreme weather disrupts travel',
					},
				},
			},
			createdAt: '2026-08-27T08:30:00.000Z',
			updatedAt: '2026-08-27T08:30:03.000Z',
		},
		{
			id: '37960f4b-80d9-4f65-83df-5bff8150a91f',
			idempotencyKey: 'storybook-history-failed-alert',
			kind: 'send',
			status: 'failed',
			sender: 'notifications-tooling-spa/v1',
			createdByEmail: 'sam@example.com',
			dryRun: false,
			scheduledFor: null,
			content: {
				items: {
					'lead-story': {
						type: 'app-push',
						title: 'Full-time result from the Champions League',
						body: 'Final score and match report',
						link: 'https://www.theguardian.com/football',
					},
				},
			},
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [
							{ type: 'sport', name: 'international' },
							{ type: 'sport', name: 'europe' },
						],
					},
					compose: { use: 'lead-story' },
				},
			},
			createdAt: '2026-08-26T21:45:00.000Z',
			updatedAt: '2026-08-26T21:45:02.000Z',
		},
		{
			id: '973bed18-14ce-4a0d-b279-d70a03af72c8',
			idempotencyKey: 'storybook-history-accepted-newsletter',
			kind: 'send',
			status: 'accepted',
			sender: 'editorial-newsletters',
			createdByEmail: 'taylor@example.com',
			dryRun: false,
			scheduledFor: null,
			content: {
				items: {
					'lead-story': {
						type: 'newsletter',
						title: 'The morning briefing: five stories to start your day',
						body: 'A concise guide to today’s essential news',
						link: 'https://www.theguardian.com/world/series/the-morning-briefing',
						media: {
							type: 'image',
							imageUrl: articleFixture.fields?.thumbnail,
							thumbnailUrl: articleFixture.fields?.thumbnail,
						},
					},
				},
			},
			channels: {
				newsletter: {
					audience: {
						type: 'email',
						items: ['briefing@example.com'],
					},
					variants: ['UK'],
					compose: {
						items: ['lead-story'],
						subject: 'The morning briefing',
					},
				},
			},
			createdAt: '2026-08-26T06:00:00.000Z',
			updatedAt: '2026-08-26T06:00:01.000Z',
		},
	],
};

const historyHandler = http.get(`${getApiBaseUrl()}/v1/notifications`, () =>
	HttpResponse.json(historyResponse),
);

const loadingHistoryHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	async () => {
		await delay('infinite');
		return HttpResponse.json(historyResponse);
	},
);

const failedHistoryHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	() => HttpResponse.json({ error: 'internal_error' }, { status: 500 }),
);

const meta = {
	title: 'Stand Frontend/HistoryPage',
	component: HistoryPage,
	parameters: {
		layout: 'fullscreen',
		msw: { handlers: [historyHandler, channelAudiencesHandler] },
	},
} satisfies Meta<typeof HistoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole('grid', { name: 'Sent alerts' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', {
				name: 'Prime minister announces cabinet reshuffle',
			}),
		).toHaveAttribute('href', 'https://www.theguardian.com/politics');
		await expect(
			canvas.getByRole('link', {
				name: 'Extreme weather disrupts travel across Europe',
			}),
		).toBeInTheDocument();
		await expect(canvas.getAllByText('No image')).toHaveLength(2);
		await expect(canvasElement.querySelectorAll('img')).toHaveLength(2);
		await expect(canvas.getByText('Partially sent')).toBeInTheDocument();
		await expect(canvas.getByText('Failed')).toBeInTheDocument();
		await expect(canvas.getByText('Accepted')).toBeInTheDocument();
		await expect(
			canvas.getAllByRole('img', { name: 'Australia' }),
		).toHaveLength(2);
	},
};

export const Loading: Story = {
	parameters: {
		msw: { handlers: [loadingHistoryHandler, channelAudiencesHandler] },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Loading history...')).toBeVisible();
		await expect(
			canvas.queryByRole('grid', { name: 'Sent alerts' }),
		).not.toBeInTheDocument();
	},
};

export const Error: Story = {
	parameters: {
		msw: { handlers: [failedHistoryHandler, channelAudiencesHandler] },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText(
				'Unable to load notification history. Try again.',
			),
		).toBeVisible();
		await expect(
			canvas.queryByRole('grid', { name: 'Sent alerts' }),
		).not.toBeInTheDocument();
	},
};
