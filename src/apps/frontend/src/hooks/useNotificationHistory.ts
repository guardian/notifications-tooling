import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirectToLogin';
import {
	type NotificationListResponse,
	notificationListResponseSchema,
} from '../schemas';

export interface NotificationHistoryQuery {
	limit: number;
	offset: number;
	since?: number;
	cacheScope?: string;
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
}: NotificationHistoryQuery) =>
	[
		...notificationHistoryQueryKey,
		cacheScope !== undefined
			? { limit, offset, cacheScope }
			: { limit, offset, since },
	] as const;

export const ALWAYS_FRESH = Infinity;

export const fetchNotificationHistory = ({
	limit,
	offset,
	since,
}: NotificationHistoryQuery): Promise<NotificationListResponse> => {
	const searchParams = new URLSearchParams({
		limit: String(limit),
		offset: String(offset),
	});

	if (since !== undefined) {
		searchParams.set('since', String(since));
	}

	return fetchJsonAndParse(
		notificationListResponseSchema,
		`/v1/notifications?${searchParams.toString()}`,
	);
};

export const useNotificationHistory = (query: NotificationHistoryQuery) =>
	useQuery({
		queryKey: getNotificationHistoryQueryKey(query),
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
	});
