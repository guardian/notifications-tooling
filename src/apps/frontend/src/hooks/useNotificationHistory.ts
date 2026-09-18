import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirect-to-login';
import {
	type NotificationListResponse,
	notificationListResponseSchema,
} from '../schemas';

export interface NotificationHistoryQuery {
	limit: number;
	offset: number;
	since?: number;
	cacheScope?: string;
	search?: string;
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
}: NotificationHistoryQuery) =>
	[
		...notificationHistoryQueryKey,
		cacheScope !== undefined
			? { limit, offset, cacheScope, ...(search ? { search } : {}) }
			: { limit, offset, since, ...(search ? { search } : {}) },
	] as const;

export const ALWAYS_FRESH = Infinity;

export const fetchNotificationHistory = ({
	limit,
	offset,
	since,
	search,
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

	return fetchJsonAndParse(
		notificationListResponseSchema,
		`/v1/notifications?${searchParams.toString()}`,
	);
};

export const useNotificationHistory = (
	query: NotificationHistoryQuery,
	{ enabled = true }: { enabled?: boolean } = {},
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
	});
