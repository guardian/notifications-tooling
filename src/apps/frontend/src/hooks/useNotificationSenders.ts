import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { notificationSendersResponseSchema } from '../schemas';
import { ALWAYS_FRESH } from './useNotificationHistory';

export const notificationSendersQueryKey = [
	'notifications',
	'senders',
] as const;

export const fetchNotificationSenders = () =>
	fetchJsonAndParse(
		notificationSendersResponseSchema,
		'/v1/notifications/senders',
	);

export const useNotificationSenders = () =>
	useQuery({
		queryKey: notificationSendersQueryKey,
		queryFn: fetchNotificationSenders,
		staleTime: ALWAYS_FRESH,
	});
