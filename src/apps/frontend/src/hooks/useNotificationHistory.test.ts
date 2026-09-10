import { describe, expect, it } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import {
	getNotificationHistoryQueryKey,
	notificationHistoryQueryKey,
	notificationHistoryStaleTime,
} from './useNotificationHistory';

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
			staleTime: notificationHistoryStaleTime,
		});
		await queryClient.fetchQuery({
			queryKey: secondMountKey,
			queryFn,
			staleTime: notificationHistoryStaleTime,
		});

		expect(requestCount).toBe(1);

		await queryClient.invalidateQueries({
			queryKey: notificationHistoryQueryKey,
		});
		await queryClient.fetchQuery({
			queryKey: secondMountKey,
			queryFn,
			staleTime: notificationHistoryStaleTime,
		});

		expect(requestCount).toBe(2);
	});
});
