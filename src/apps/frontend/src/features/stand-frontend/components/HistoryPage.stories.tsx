import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { getApiBaseUrl } from '../../../api/config';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { channelAudiencesHandler } from '../../../mocks/handlers/channels';
import type { NotificationListResponse } from '../api/schemas';
import { HistoryPage } from './HistoryPage';

const historyResponse: NotificationListResponse = {
	total: 1,
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
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'lead-story' },
				},
			},
			createdAt: '2026-08-28T12:00:00.000Z',
			updatedAt: '2026-08-28T12:00:01.000Z',
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
			await canvas.findByRole('link', {
				name: 'Breaking News',
			}),
		).toHaveAttribute('href', 'https://www.theguardian.com/politics');
		await expect(await canvas.findByText(/Breaking news/)).toBeVisible();
		await expect(canvas.getByText('alex@example.com')).toBeVisible();
		await expect(canvasElement.querySelector('img')).toHaveAttribute(
			'src',
			articleFixture.fields?.thumbnail,
		);
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
