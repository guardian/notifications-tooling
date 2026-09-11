import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { notificationResourceSchema } from '../schemas';

export const fetchNotificationDetail = (notificationId: string) =>
	fetchJsonAndParse(
		notificationResourceSchema,
		`/v1/notifications/${notificationId}`,
	);

export const useNotificationDetail = (notificationId?: string) =>
	useQuery({
		queryKey: ['notifications', 'detail', notificationId],
		queryFn: () => fetchNotificationDetail(notificationId!),
		enabled: notificationId !== undefined,
	});
