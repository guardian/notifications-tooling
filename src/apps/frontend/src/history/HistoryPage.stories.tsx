import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { getApiBaseUrl } from '../api-client/config';
import type {
	NotificationListResponse,
	NotificationResource,
} from '../schemas';
import { articleFixture } from '../testing/capi-fixtures';
import { channelAudiencesHandler } from '../testing/handlers/channels';
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
						title: 'Breaking news',
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

const historyRequest = fn();
const historyHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	async () => {
		historyRequest();
		await delay(300);
		return HttpResponse.json(historyResponse);
	},
);

const partialFailureDetail: NotificationResource = {
	...historyResponse.notifications[1]!,
	dispatches: [
		{
			id: 'a1495707-6400-4765-b019-c2409233a73c',
			channel: 'newsletter',
			requested: { channel: 'newsletter', segment: 'AU' },
			resolved: {
				channel: 'newsletter',
				brazeCampaignId: 'campaign-au',
				emailRenderingId: 'render-au',
			},
			status: 'success',
			providerRef: 'dispatch-au',
			failureReason: null,
			providerStatusCode: 201,
			createdAt: '2026-08-27T08:30:01.000Z',
			updatedAt: '2026-08-27T08:30:02.000Z',
		},
		{
			id: '17bc36c1-f8cb-47c8-a2f0-d12813b96796',
			channel: 'newsletter',
			requested: { channel: 'newsletter', segment: 'US' },
			resolved: {
				channel: 'newsletter',
				brazeCampaignId: 'campaign-us',
				emailRenderingId: 'render-us',
			},
			status: 'failure',
			providerRef: null,
			failureReason: 'http_error',
			providerStatusCode: 500,
			createdAt: '2026-08-27T08:30:01.000Z',
			updatedAt: '2026-08-27T08:30:03.000Z',
		},
		{
			id: '885b46f3-dcc5-4e74-bc9a-15c20a995cb3',
			channel: 'newsletter',
			requested: { channel: 'newsletter', segment: 'UK' },
			resolved: {
				channel: 'newsletter',
				brazeCampaignId: 'campaign-uk',
				emailRenderingId: 'render-uk',
			},
			status: 'failure',
			providerRef: null,
			failureReason: 'timeout',
			providerStatusCode: 504,
			createdAt: '2026-08-27T08:30:01.000Z',
			updatedAt: '2026-08-27T08:30:04.000Z',
		},
	],
};

const noOutcomeFailureDetail: NotificationResource = {
	...historyResponse.notifications[2]!,
	dispatches: [],
};

const failureDetailHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications/:notificationId`,
	({ params }) =>
		HttpResponse.json(
			params.notificationId === noOutcomeFailureDetail.id
				? noOutcomeFailureDetail
				: partialFailureDetail,
		),
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
	title: 'Dispatch/History/HistoryPage',
	component: HistoryPage,
	parameters: {
		layout: 'fullscreen',
		msw: {
			handlers: [historyHandler, failureDetailHandler, channelAudiencesHandler],
		},
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
		const refreshButton = canvas.getByRole('button', {
			name: 'Refresh activity',
		});
		historyRequest.mockClear();
		await userEvent.click(refreshButton);
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			await expect(refreshButton).toBeDisabled();
		});
		await waitFor(async () => {
			await expect(refreshButton).toBeEnabled();
		});
		const articleLink = canvas.getByRole('link', {
			name: /Prime minister announces cabinet reshuffle/,
		});
		await expect(articleLink).toHaveAttribute(
			'href',
			'https://www.theguardian.com/politics',
		);
		await expect(
			canvas.getByRole('link', {
				name: /Prime minister announces cabinet reshuffle/,
			}),
		).toHaveAttribute('href', 'https://www.theguardian.com/politics');
		const failedNotification = canvas.getByRole('button', {
			name: 'Partially sent: Show failure details for Extreme weather disrupts travel across Europe',
		});
		await expect(failedNotification).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', {
				name: /Extreme weather disrupts travel across Europe/,
			}),
		).toBeInTheDocument();
		await expect(canvas.getAllByText('No image')).toHaveLength(2);
		await expect(canvasElement.querySelectorAll('img')).toHaveLength(2);
		await expect(
			canvas.getByRole('button', {
				name: 'Failed: Show failure details for Final score and match report',
			}),
		).toBeInTheDocument();
		await expect(canvas.getByText('Accepted')).toBeInTheDocument();
		await expect(
			canvas.getAllByRole('img', { name: 'Australia' }),
		).toHaveLength(2);

		await userEvent.click(failedNotification);
		const page = within(document.body);
		const tooltip = await page.findByRole('tooltip');
		const failures = within(tooltip).getAllByRole('listitem');
		await expect(failures).toHaveLength(2);
		await expect(failures[0]).toHaveTextContent(
			'US via newsletter email. The downstream service rejected the request. Provider status: 500.',
		);
		await expect(failures[1]).toHaveTextContent(
			'UK via newsletter email. The downstream service did not respond in time. Provider status: 504.',
		);
		await expect(tooltip).toHaveTextContent(
			'Please contact Central Production for support.',
		);
		await expect(page.queryByRole('dialog')).not.toBeInTheDocument();
	},
};

export const FailureWithoutDispatchOutcomes: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const failedNotification = await canvas.findByRole('button', {
			name: 'Failed: Show failure details for Final score and match report',
		});

		await userEvent.click(failedNotification);
		const tooltip = await within(document.body).findByRole('tooltip');
		await expect(tooltip).toHaveTextContent(
			'Failure: No per-destination failure details are available.',
		);
		await expect(tooltip).not.toHaveTextContent(
			'Failure details could not be loaded.',
		);
	},
};

export const Loading: Story = {
	parameters: {
		msw: { handlers: [loadingHistoryHandler, channelAudiencesHandler] },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('status', { name: 'Loading alert history' }),
		).toHaveAttribute('aria-busy', 'true');
		await expect(
			canvas.getByRole('grid', { name: 'Loading sent alerts' }),
		).toBeVisible();
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
