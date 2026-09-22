import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirect-to-login';
import {
	type NotificationListResponse,
	notificationListResponseSchema,
} from '../schemas';
import type { HistoryStatusCategory } from '../utils/history-search-params';

export interface NotificationHistoryQuery {
	limit: number;
	offset: number;
	since?: number;
	cacheScope?: string;
	search?: string;
	audiences?: string[];
	statuses?: HistoryStatusCategory[];
}

export const notificationHistoryQueryKey = [
	'notifications',
	'history',
] as const;

export const getNotificationHistoryQueryKey = ({
	limit,
	offset,
	since,
	cacheScope,
	search,
	audiences,
	statuses,
}: NotificationHistoryQuery) =>
	[
		...notificationHistoryQueryKey,
		cacheScope !== undefined
			? {
					limit,
					offset,
					cacheScope,
					...(search ? { search } : {}),
					...(audiences?.length ? { audiences } : {}),
					...(statuses?.length ? { statuses } : {}),
				}
			: {
					limit,
					offset,
					since,
					...(search ? { search } : {}),
					...(audiences?.length ? { audiences } : {}),
					...(statuses?.length ? { statuses } : {}),
				},
	] as const;

export const ALWAYS_FRESH = Infinity;
export const NOTIFICATION_HISTORY_POLL_INTERVAL_MS = 30_000;

export const fetchNotificationHistory = ({
	limit,
	offset,
	since,
	search,
	audiences,
	statuses,
}: NotificationHistoryQuery): Promise<NotificationListResponse> => {
	const searchParams = new URLSearchParams({
		limit: String(limit),
		offset: String(offset),
	});

	if (since !== undefined) {
		searchParams.set('since', String(since));
	}
	if (search !== undefined) {
		searchParams.set('search', search);
	}
	for (const audience of audiences ?? []) {
		searchParams.append('audience', audience);
	}
	for (const status of statuses ?? []) {
		searchParams.append('status', status);
	}

	return fetchJsonAndParse(
		notificationListResponseSchema,
		`/v1/notifications?${searchParams.toString()}`,
	);
};

export const useNotificationHistory = (
	query: NotificationHistoryQuery,
	{
		enabled = true,
		refetchInterval = NOTIFICATION_HISTORY_POLL_INTERVAL_MS,
	}: { enabled?: boolean; refetchInterval?: number } = {},
) =>
	useQuery({
		queryKey: getNotificationHistoryQueryKey(query),
		enabled,
		queryFn: async () => {
			try {
				return await fetchNotificationHistory(query);
			} catch (error) {
				if (
					error instanceof ApiError &&
					error.failure === 'unauthenticated' &&
					error.loginUrl
				) {
					redirectToLogin(error.loginUrl);
				}
				throw error;
			}
		},
		placeholderData: keepPreviousData,
		staleTime: ALWAYS_FRESH,
		refetchInterval,
	});
