import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	mock,
} from 'bun:test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import '../../happydom-setup';
import {
	ALWAYS_FRESH,
	fetchNotificationHistory,
	getNotificationHistoryQueryKey,
	NOTIFICATION_HISTORY_POLL_INTERVAL_MS,
	notificationHistoryQueryKey,
	useNotificationHistory,
} from './useNotificationHistory';

const originalFetch = globalThis.fetch;
const originalLocation = Object.getOwnPropertyDescriptor(
	globalThis,
	'location',
);

beforeAll(() => {
	Object.defineProperty(globalThis, 'location', {
		configurable: true,
		value: { origin: 'http://localhost:3000' },
	});
});

afterEach(() => {
	globalThis.fetch = originalFetch;
});

afterAll(() => {
	if (originalLocation) {
		Object.defineProperty(globalThis, 'location', originalLocation);
	} else {
		Reflect.deleteProperty(globalThis, 'location');
	}
});

describe('fetchNotificationHistory', () => {
	it('serializes search and repeated filter query parameters', async () => {
		let requestUrl: URL | undefined;
		const fetchMock = mock((input: RequestInfo | URL) => {
			const url =
				typeof input === 'string'
					? input
					: input instanceof URL
						? input.href
						: input.url;
			requestUrl = new URL(url);

			return Promise.resolve(
				Response.json({
					total: 0,
					limit: 20,
					offset: 0,
					notifications: [],
				}),
			);
		});
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await fetchNotificationHistory({
			limit: 20,
			offset: 40,
			since: 1_700_000_000,
			search: 'climate',
			audiences: ['uk', 'europe'],
			statuses: ['sent', 'error'],
		});

		if (!requestUrl) {
			throw new Error('Expected notification history to be requested');
		}
		expect(requestUrl.pathname).toBe('/v1/notifications');
		expect(requestUrl.searchParams.get('limit')).toBe('20');
		expect(requestUrl.searchParams.get('offset')).toBe('40');
		expect(requestUrl.searchParams.get('since')).toBe('1700000000');
		expect(requestUrl.searchParams.get('search')).toBe('climate');
		expect(requestUrl.searchParams.getAll('audience')).toEqual([
			'uk',
			'europe',
		]);
		expect(requestUrl.searchParams.getAll('status')).toEqual(['sent', 'error']);
	});
});

describe('notification history query keys', () => {
	it('separates pages and date windows in the cache', () => {
		expect(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 20,
				since: 1_700_000_000,
			}),
		).toEqual([
			...notificationHistoryQueryKey,
			{ limit: 20, offset: 20, since: 1_700_000_000 },
		]);
	});

	it('separates search terms in the cache', () => {
		expect(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 0,
				search: 'climate',
			}),
		).not.toEqual(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 0,
				search: 'sport',
			}),
		);
	});

	it('separates audience filters in the cache', () => {
		expect(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 0,
				audiences: ['uk'],
			}),
		).not.toEqual(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 0,
				audiences: ['us'],
			}),
		);
	});

	it('separates status filters in the cache', () => {
		expect(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 0,
				statuses: ['sent'],
			}),
		).not.toEqual(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 0,
				statuses: ['error'],
			}),
		);
	});

	it('canonicalizes categories while separating combined filters', () => {
		const query = {
			limit: 10,
			offset: 20,
			since: 1700000000,
			search: 'election',
		};
		const key = getNotificationHistoryQueryKey({
			...query,
			alertTypes: ['sport', 'exclusive', 'sport'],
		});
		expect(key).toEqual(
			getNotificationHistoryQueryKey({
				...query,
				alertTypes: ['exclusive', 'sport'],
			}),
		);
		expect(key).not.toEqual(
			getNotificationHistoryQueryKey({ ...query, alertTypes: ['sport'] }),
		);
		expect(key).not.toEqual(
			getNotificationHistoryQueryKey({
				...query,
				search: 'weather',
				alertTypes: ['sport', 'exclusive'],
			}),
		);
		expect(
			getNotificationHistoryQueryKey({ ...query, alertTypes: [] }),
		).toEqual(getNotificationHistoryQueryKey(query));
		expect(
			getNotificationHistoryQueryKey({ ...query, alertTypes: [''] }),
		).not.toEqual(getNotificationHistoryQueryKey(query));
	});

	it('uses a stable cache scope for a moving date window', () => {
		const firstMountKey = getNotificationHistoryQueryKey({
			limit: 20,
			offset: 0,
			since: 1_700_000_000,
			cacheScope: 'last-24-hours',
		});
		const secondMountKey = getNotificationHistoryQueryKey({
			limit: 20,
			offset: 0,
			since: 1_700_000_100,
			cacheScope: 'last-24-hours',
		});

		expect(firstMountKey).toEqual(secondMountKey);
		expect(firstMountKey).toEqual([
			...notificationHistoryQueryKey,
			{ limit: 20, offset: 0, cacheScope: 'last-24-hours' },
		]);
	});

	it('keeps scoped dashboard data separate from unscoped history data', () => {
		expect(
			getNotificationHistoryQueryKey({
				limit: 20,
				offset: 0,
				since: 1_700_000_000,
				cacheScope: 'last-24-hours',
			}),
		).not.toEqual(getNotificationHistoryQueryKey({ limit: 20, offset: 0 }));
	});

	it('reuses cached dashboard data until notification history is invalidated', async () => {
		const queryClient = new QueryClient();
		let requestCount = 0;
		const queryFn = () => Promise.resolve(++requestCount);
		const firstMountKey = getNotificationHistoryQueryKey({
			limit: 20,
			offset: 0,
			since: 1_700_000_000,
			cacheScope: 'last-24-hours',
		});
		const secondMountKey = getNotificationHistoryQueryKey({
			limit: 20,
			offset: 0,
			since: 1_700_000_100,
			cacheScope: 'last-24-hours',
		});

		await queryClient.fetchQuery({
			queryKey: firstMountKey,
			queryFn,
			staleTime: ALWAYS_FRESH,
		});
		await queryClient.fetchQuery({
			queryKey: secondMountKey,
			queryFn,
			staleTime: ALWAYS_FRESH,
		});

		expect(requestCount).toBe(1);

		await queryClient.invalidateQueries({
			queryKey: notificationHistoryQueryKey,
		});
		await queryClient.fetchQuery({
			queryKey: secondMountKey,
			queryFn,
			staleTime: ALWAYS_FRESH,
		});

		expect(requestCount).toBe(2);
	});

	it('configures notification history polling', async () => {
		let requestCount = 0;
		globalThis.fetch = mock(() => {
			requestCount += 1;
			return Promise.resolve(
				Response.json({
					total: 0,
					limit: 20,
					offset: 0,
					notifications: [],
				}),
			);
		}) as unknown as typeof fetch;

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const wrapper = ({ children }: { children: React.ReactNode }) =>
			createElement(QueryClientProvider, { client: queryClient }, children);
		renderHook(
			() =>
				useNotificationHistory(
					{
						limit: 20,
						offset: 0,
					},
					{
						refetchInterval: 10,
					},
				),
			{ wrapper },
		);

		await waitFor(() => expect(requestCount).toBe(1));
		const query = queryClient.getQueryCache().find({
			queryKey: getNotificationHistoryQueryKey({ limit: 20, offset: 0 }),
		});

		expect(
			(query?.options as { refetchInterval?: number }).refetchInterval,
		).toBe(10);
		expect(NOTIFICATION_HISTORY_POLL_INTERVAL_MS).toBe(30_000);
	});
});
