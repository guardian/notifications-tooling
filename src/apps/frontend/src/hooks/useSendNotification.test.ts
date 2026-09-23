import { describe, expect, it } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api-client/errors';
import {
	deliveredNewsletterEmailSendResponse,
	failedNewsletterSendResponse,
} from '../testing/api-fixtures';
import { getNotificationHistoryQueryKey } from './useNotificationHistory';
import { notificationSendersQueryKey } from './useNotificationSenders';
import { invalidateNotificationHistoryAfterSend } from './useSendNotification';

const historyQueryKey = getNotificationHistoryQueryKey({
	limit: 20,
	offset: 0,
});
const latest24HoursQueryKey = getNotificationHistoryQueryKey({
	limit: 20,
	offset: 0,
	since: 1_700_000_000,
	cacheScope: 'last-24-hours',
});

const createPopulatedQueryClient = async () => {
	const queryClient = new QueryClient();
	let historyRequestCount = 0;
	let latest24HoursRequestCount = 0;
	let sendersRequestCount = 0;
	await queryClient.fetchQuery({
		queryKey: historyQueryKey,
		queryFn: () => Promise.resolve(++historyRequestCount),
	});
	await queryClient.fetchQuery({
		queryKey: latest24HoursQueryKey,
		queryFn: () => Promise.resolve(++latest24HoursRequestCount),
	});
	await queryClient.fetchQuery({
		queryKey: notificationSendersQueryKey,
		queryFn: () => Promise.resolve(++sendersRequestCount),
	});
	return {
		queryClient,
		requestCounts: () => ({
			historyRequestCount,
			latest24HoursRequestCount,
			sendersRequestCount,
		}),
	};
};

describe('invalidateNotificationHistoryAfterSend', () => {
	it.each([
		{
			name: 'successful send',
			result: {
				success: true,
				data: deliveredNewsletterEmailSendResponse,
			} as const,
		},
		{
			name: 'persisted dispatch failure',
			result: {
				success: false,
				failure: {
					failure: 'dispatch-fail',
					notification: failedNewsletterSendResponse,
				},
			} as const,
		},
	])(
		'refreshes history and latest 24 hours after a $name',
		async ({ result }) => {
			const { queryClient, requestCounts } = await createPopulatedQueryClient();

			await invalidateNotificationHistoryAfterSend(queryClient, result);

			expect(requestCounts()).toEqual({
				historyRequestCount: 2,
				latest24HoursRequestCount: 2,
				sendersRequestCount: 2,
			});
		},
	);

	it('does not invalidate history when no notification was persisted', async () => {
		const { queryClient, requestCounts } = await createPopulatedQueryClient();

		await invalidateNotificationHistoryAfterSend(queryClient, {
			success: false,
			failure: new ApiError({
				message: 'Network request failed',
				failure: 'fetch-fail',
			}),
		});

		expect(requestCounts()).toEqual({
			historyRequestCount: 1,
			latest24HoursRequestCount: 1,
			sendersRequestCount: 1,
		});
	});
});
