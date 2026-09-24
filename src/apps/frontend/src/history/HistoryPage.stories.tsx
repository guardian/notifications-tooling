import { notificationAudienceFilterIds } from '@models';
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
import {
	notificationSenders,
	notificationSendersHandler,
} from '../testing/handlers/notifications';
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

const historyRequest = fn((requestUrl: URL) => requestUrl);
const historyHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	async ({ request }) => {
		const requestUrl = new URL(request.url);
		historyRequest(requestUrl);
		await delay(300);
		const selectedSenders = requestUrl.searchParams.getAll('createdByEmail');
		const notifications = selectedSenders.length
			? historyResponse.notifications.filter(({ createdByEmail }) =>
					selectedSenders.includes(createdByEmail.toLowerCase()),
				)
			: historyResponse.notifications;
		return HttpResponse.json({
			...historyResponse,
			total: notifications.length,
			notifications,
		});
	},
);

const senderRequest = fn();
const refreshNotificationSendersHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications/senders`,
	() => {
		senderRequest();
		return HttpResponse.json({ senders: notificationSenders });
	},
);

const senderCutoff = 1_700_000_000;
const cutoffNotificationSendersHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications/senders`,
	({ request }) =>
		HttpResponse.json({
			senders:
				new URL(request.url).searchParams.get('since') === String(senderCutoff)
					? ['historic.sender@example.com']
					: ['recent.sender@example.com'],
		}),
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
			providerStatusCode: null,
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

const invalidSearchRequest = fn((requestUrl: URL) => requestUrl);
const emptyHistoryHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	({ request }) => {
		invalidSearchRequest(new URL(request.url));
		return HttpResponse.json({
			...historyResponse,
			total: 0,
			notifications: [],
		});
	},
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

const initialHistoryUrl = (query: string) => () => {
	historyRequest.mockClear();
	window.history.replaceState(
		{},
		'',
		`${window.location.pathname}${query ? `?${query}` : ''}`,
	);
	return {};
};

const meta = {
	title: 'Dispatch/History/HistoryPage',
	component: HistoryPage,
	loaders: [initialHistoryUrl('')],
	parameters: {
		layout: 'fullscreen',
		msw: {
			handlers: [
				notificationSendersHandler,
				historyHandler,
				failureDetailHandler,
				channelAudiencesHandler,
			],
		},
	},
} satisfies Meta<typeof HistoryPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
	parameters: {
		msw: {
			handlers: [
				refreshNotificationSendersHandler,
				historyHandler,
				failureDetailHandler,
				channelAudiencesHandler,
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole('grid', { name: 'Sent alerts' }),
		).toBeInTheDocument();
		await expect(canvas.getByText('Clear all')).not.toBeVisible();
		const refreshButton = canvas.getByRole('button', {
			name: 'Refresh activity',
		});
		historyRequest.mockClear();
		senderRequest.mockClear();
		await userEvent.click(refreshButton);
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			await expect(senderRequest).toHaveBeenCalledOnce();
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
		const failures = await within(tooltip).findAllByRole('listitem');
		await expect(failures).toHaveLength(2);
		await expect(failures[0]).toHaveTextContent(
			'United States via newsletter email. The downstream service rejected the request. Provider status: 500.',
		);
		await expect(failures[1]).toHaveTextContent(
			'United Kingdom via newsletter email. The downstream service did not respond in time.',
		);
		await expect(failures[1]).not.toHaveTextContent('Provider status:');
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
		await waitFor(async () =>
			expect(tooltip).toHaveTextContent(
				'Failure: No per-destination failure details are available.',
			),
		);
		await expect(tooltip).not.toHaveTextContent(
			'Failure details could not be loaded.',
		);
	},
};

export const Search: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		historyRequest.mockClear();

		const searchInput = canvas.getByRole('searchbox', { name: 'Search' });
		await userEvent.type(searchInput, 'weather');

		await expect(searchInput).toHaveValue('weather');
		await expect(historyRequest).not.toHaveBeenCalled();
		await expect(
			new URLSearchParams(window.location.search).get('search'),
		).toBe('weather');
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			const requestUrl = historyRequest.mock.calls[0]?.[0];
			await expect(requestUrl?.searchParams.get('search')).toBe('weather');
			await expect(requestUrl?.searchParams.get('offset')).toBe('0');
		});
	},
};

export const ChannelFilter: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		historyRequest.mockClear();

		const searchInput = canvas.getByRole('searchbox', { name: 'Search' });
		const channelFilter = canvas.getByRole('button', { name: 'Channel All' });
		await expect(channelFilter.getBoundingClientRect().top).toBeGreaterThan(
			searchInput.getBoundingClientRect().bottom,
		);

		await userEvent.click(channelFilter);
		const page = within(canvasElement.ownerDocument.body);
		const newsletter = await page.findByRole('menuitemcheckbox', {
			name: 'Newsletter email',
		});
		await expect(page.getAllByRole('menuitemcheckbox')).toHaveLength(2);
		await expect(
			page.getByRole('menuitemcheckbox', { name: 'App alert' }),
		).toBeInTheDocument();
		await userEvent.click(newsletter);

		await expect(newsletter).toBeChecked();
		await expect(
			canvas.getByRole('button', { name: 'Channel Newsletter email' }),
		).toBeInTheDocument();
		await expect(
			new URLSearchParams(window.location.search).getAll('channel'),
		).toEqual(['newsletter']);
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			const requestUrl = historyRequest.mock.calls[0]?.[0];
			await expect(requestUrl?.searchParams.getAll('channel')).toEqual([
				'newsletter',
			]);
			await expect(requestUrl?.searchParams.get('offset')).toBe('0');
		});
	},
};

export const AudienceFilter: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		historyRequest.mockClear();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Audience / Editions All' }),
		);
		const page = within(canvasElement.ownerDocument.body);
		const unitedKingdom = await page.findByRole('menuitemcheckbox', {
			name: 'United Kingdom',
		});
		await expect(page.getAllByRole('menuitemcheckbox')).toHaveLength(
			notificationAudienceFilterIds.length,
		);
		await userEvent.click(unitedKingdom);

		await expect(unitedKingdom).toBeChecked();
		await expect(
			canvas.getByRole('button', {
				name: 'Audience / Editions United Kingdom',
			}),
		).toBeInTheDocument();
		await expect(
			new URLSearchParams(window.location.search).getAll('audience'),
		).toEqual(['uk']);
		await expect(
			canvas.getByRole('button', { name: 'Clear all' }),
		).toBeInTheDocument();
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			const requestUrl = historyRequest.mock.calls[0]?.[0];
			await expect(requestUrl?.searchParams.getAll('audience')).toEqual(['uk']);
			await expect(requestUrl?.searchParams.get('offset')).toBe('0');
		});

		const unitedStates = page.getByRole('menuitemcheckbox', {
			name: 'United States',
		});
		await userEvent.click(unitedStates);

		await expect(unitedStates).toBeChecked();
		await expect(
			canvas.getByRole('button', {
				name: 'Audience / Editions United Kingdom, United States',
			}),
		).toBeInTheDocument();
		await expect(
			new URLSearchParams(window.location.search).getAll('audience'),
		).toEqual(['uk', 'us']);
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledTimes(2);
			const requestUrl = historyRequest.mock.calls[1]?.[0];
			await expect(requestUrl?.searchParams.getAll('audience')).toEqual([
				'uk',
				'us',
			]);
			await expect(requestUrl?.searchParams.get('offset')).toBe('0');
		});
	},
};

export const SenderFilter: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		historyRequest.mockClear();

		await userEvent.click(canvas.getByRole('button', { name: 'Sender All' }));
		const page = within(canvasElement.ownerDocument.body);
		const senderMenu = await page.findByRole('menu');
		await expect(senderMenu.scrollWidth).toBeLessThanOrEqual(
			senderMenu.clientWidth,
		);
		await expect(
			page.getByRole('menuitemcheckbox', {
				name: 'Very Long Editorial Sender Address',
			}),
		).toBeVisible();
		const alex = await page.findByRole('menuitemcheckbox', { name: 'Alex' });
		await userEvent.click(alex);

		await expect(alex).toBeChecked();
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			await expect(
				canvas.getByRole('link', {
					name: /Prime minister announces cabinet reshuffle/,
				}),
			).toBeVisible();
			await expect(
				canvas.queryByRole('link', {
					name: /Extreme weather disrupts travel across Europe/,
				}),
			).not.toBeInTheDocument();
		});

		const jamie = page.getByRole('menuitemcheckbox', { name: 'Jamie' });
		await userEvent.click(jamie);

		await expect(jamie).toBeChecked();
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledTimes(2);
			const requestUrl = historyRequest.mock.calls[1]?.[0];
			await expect(requestUrl?.searchParams.getAll('createdByEmail')).toEqual([
				'alex@example.com',
				'jamie@example.com',
			]);
			await expect(
				canvas.getByRole('link', {
					name: /Prime minister announces cabinet reshuffle/,
				}),
			).toBeVisible();
			await expect(
				canvas.getByRole('link', {
					name: /Extreme weather disrupts travel across Europe/,
				}),
			).toBeVisible();
		});
	},
};

export const SenderFilterCutoff: Story = {
	loaders: [
		() => {
			window.history.replaceState(
				{},
				'',
				`${window.location.pathname}?since=${senderCutoff}`,
			);
			return {};
		},
	],
	parameters: {
		msw: {
			handlers: [
				cutoffNotificationSendersHandler,
				historyHandler,
				failureDetailHandler,
				channelAudiencesHandler,
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole('grid', { name: 'Sent alerts' });

		await userEvent.click(canvas.getByRole('button', { name: 'Sender All' }));
		const page = within(canvasElement.ownerDocument.body);
		await expect(
			await page.findByRole('menuitemcheckbox', { name: 'Historic Sender' }),
		).toBeVisible();
		await expect(
			page.queryByRole('menuitemcheckbox', { name: 'Recent Sender' }),
		).not.toBeInTheDocument();
	},
};

export const StatusFilter: Story = {
	loaders: [
		() => {
			window.history.replaceState({}, '', window.location.pathname);
			return {};
		},
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		historyRequest.mockClear();

		const audienceFilter = canvas.getByRole('button', {
			name: 'Audience / Editions All',
		});
		const statusFilter = canvas.getByRole('button', { name: 'Status All' });
		await expect(statusFilter.getBoundingClientRect().top).toBeGreaterThan(
			audienceFilter.getBoundingClientRect().bottom,
		);

		await userEvent.click(statusFilter);
		const page = within(canvasElement.ownerDocument.body);
		const sent = await page.findByRole('menuitemcheckbox', { name: 'Sent' });
		await userEvent.click(sent);

		await expect(sent).toBeChecked();
		await expect(
			canvas.getByRole('button', { name: 'Status Sent' }),
		).toBeInTheDocument();
		await expect(
			new URLSearchParams(window.location.search).getAll('status'),
		).toEqual(['sent']);
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			const requestUrl = historyRequest.mock.calls[0]?.[0];
			await expect(requestUrl?.searchParams.getAll('status')).toEqual(['sent']);
			await expect(requestUrl?.searchParams.get('offset')).toBe('0');
		});

		const error = page.getByRole('menuitemcheckbox', { name: 'Error' });
		await userEvent.click(error);

		await expect(error).toBeChecked();
		await expect(
			canvas.getByRole('button', { name: 'Status Sent, Error' }),
		).toBeInTheDocument();
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledTimes(2);
			const requestUrl = historyRequest.mock.calls[1]?.[0];
			await expect(requestUrl?.searchParams.getAll('status')).toEqual([
				'sent',
				'error',
			]);
		});
	},
};

export const ClearAllFilters: Story = {
	loaders: [
		() => {
			window.history.replaceState(
				{},
				'',
				`${window.location.pathname}?search=weather&createdByEmail=alex%40example.com&audience=uk&status=error&offset=20&limit=10`,
			);
			return {};
		},
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		await expect(canvas.getByRole('searchbox', { name: 'Search' })).toHaveValue(
			'weather',
		);
		await expect(
			canvas.getByRole('button', { name: 'Sender Alex' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('button', {
				name: 'Audience / Editions United Kingdom',
			}),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('button', { name: 'Status Error' }),
		).toBeInTheDocument();

		await userEvent.click(canvas.getByRole('button', { name: 'Clear all' }));

		await expect(canvas.getByRole('searchbox', { name: 'Search' })).toHaveValue(
			'',
		);
		await expect(
			canvas.getByRole('button', { name: 'Sender All' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('button', { name: 'Audience / Editions All' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('button', { name: 'Status All' }),
		).toBeInTheDocument();
		await expect(canvas.getByText('Clear all')).not.toBeVisible();
		await expect(window.location.search).toBe('');
	},
};

export const InvalidSearch: Story = {
	loaders: [
		() => {
			invalidSearchRequest.mockClear();
			window.history.replaceState(
				{},
				'',
				`${window.location.pathname}?search=${'a'.repeat(201)}`,
			);
			return {};
		},
	],
	parameters: {
		msw: {
			handlers: [
				notificationSendersHandler,
				emptyHistoryHandler,
				channelAudiencesHandler,
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			await canvas.findByRole('heading', { name: 'No alerts yet' }),
		).toBeVisible();
		await expect(canvas.getByRole('searchbox', { name: 'Search' })).toHaveValue(
			'',
		);
		await expect(invalidSearchRequest).toHaveBeenCalledOnce();
		const requestUrl = invalidSearchRequest.mock.calls[0]?.[0];
		await expect(requestUrl?.searchParams.has('search')).toBe(false);
	},
};

export const CategoryFilter: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(document.body);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		const trigger = canvas.getByRole('button', {
			name: 'Kicker / Alert type All',
		});
		historyRequest.mockClear();

		await userEvent.click(trigger);
		await expect(
			page.getAllByRole('menuitemcheckbox').map((option) => option.textContent),
		).toEqual([
			expect.stringContaining('None'),
			expect.stringContaining('Breaking news'),
			expect.stringContaining('Exclusive'),
			expect.stringContaining("Editors' picks"),
			expect.stringContaining('One not to miss'),
			expect.stringContaining('Sports'),
		]);

		await userEvent.click(
			page.getByRole('menuitemcheckbox', { name: 'Sports' }),
		);
		await expect(
			page.getByRole('menu', { name: 'Kicker / Alert type' }),
		).toBeVisible();
		await expect(
			page.getByRole('menuitemcheckbox', { name: 'Sports' }),
		).toHaveAttribute('aria-checked', 'true');
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			await expect(
				historyRequest.mock.calls[0]![0].searchParams.getAll('alertType'),
			).toEqual(['sport']);
		});

		for (const name of [
			'None',
			'Breaking news',
			'Exclusive',
			"Editors' picks",
			'One not to miss',
		]) {
			await userEvent.click(page.getByRole('menuitemcheckbox', { name }));
		}
		await userEvent.keyboard('{Escape}');
		await expect(trigger).toHaveFocus();

		const summary =
			"None, Breaking news, Exclusive, Editors' picks, One not to miss, Sports";
		await expect(trigger).toHaveAccessibleName(
			`Kicker / Alert type ${summary}`,
		);
		const label = within(trigger).getByText(summary);
		await expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
		await expect(getComputedStyle(label).whiteSpace).toBe('nowrap');
		await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
		await expect(trigger.getBoundingClientRect().height).toBe(40);
	},
};

export const InvalidCategoryFilter: Story = {
	loaders: [
		initialHistoryUrl(
			'search=weather&alertType=sport&alertType=&alertType=unknown&offset=20&limit=10&since=1700000000&other=keep',
		),
	],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText('Invalid Kicker / Alert type filter.'),
		).toBeVisible();
		await expect(historyRequest).not.toHaveBeenCalled();
		await expect(canvas.queryByRole('grid')).not.toBeInTheDocument();
		await expect(
			canvas.getByRole('button', {
				name: 'Kicker / Alert type Invalid filter',
			}),
		).toBeDisabled();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Clear Kicker / Alert type filter' }),
		);
		await canvas.findByRole('grid', { name: 'Sent alerts' });
		await expect(
			new URLSearchParams(window.location.search).has('alertType'),
		).toBe(false);
		await expect(
			new URLSearchParams(window.location.search).get('search'),
		).toBe('weather');
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			await expect(
				historyRequest.mock.calls[0]![0].searchParams.has('alertType'),
			).toBe(false);
		});
		await expect(
			canvas.getByRole('button', { name: 'Kicker / Alert type All' }),
		).toBeEnabled();
	},
};

export const Loading: Story = {
	parameters: {
		msw: {
			handlers: [
				notificationSendersHandler,
				loadingHistoryHandler,
				channelAudiencesHandler,
			],
		},
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
		msw: {
			handlers: [
				notificationSendersHandler,
				failedHistoryHandler,
				channelAudiencesHandler,
			],
		},
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
