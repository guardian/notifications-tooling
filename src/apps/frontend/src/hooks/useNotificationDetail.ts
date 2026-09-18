import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirect-to-login';
import { notificationResourceSchema } from '../schemas';

export const fetchNotificationDetail = async (notificationId: string) => {
	try {
		return await fetchJsonAndParse(
			notificationResourceSchema,
			`/v1/notifications/${notificationId}`,
		);
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
};

export const useNotificationDetail = (notificationId?: string) =>
	useQuery({
		queryKey: ['notifications', 'detail', notificationId],
		queryFn: () => fetchNotificationDetail(notificationId!),
		enabled: notificationId !== undefined,
	});
