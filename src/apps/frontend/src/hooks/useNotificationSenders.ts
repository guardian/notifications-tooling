import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { notificationSendersResponseSchema } from '../schemas';
import { ALWAYS_FRESH } from './useNotificationHistory';

export const notificationSendersQueryKey = [
	'notifications',
	'senders',
] as const;

export const getNotificationSendersQueryKey = (since?: number) =>
	[...notificationSendersQueryKey, { since }] as const;

export const fetchNotificationSenders = (since?: number) =>
	fetchJsonAndParse(
		notificationSendersResponseSchema,
		`/v1/notifications/senders${since === undefined ? '' : `?since=${since}`}`,
	);

export const useNotificationSenders = (since?: number) =>
	useQuery({
		queryKey: getNotificationSendersQueryKey(since),
		queryFn: () => fetchNotificationSenders(since),
		staleTime: ALWAYS_FRESH,
	});
