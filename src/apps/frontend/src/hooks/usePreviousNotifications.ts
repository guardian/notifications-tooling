import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirect-to-login';
import { notificationListResponseSchema } from '../schemas';

export const fetchPreviousNotifications = async (articleId: string) => {
	try {
		return await fetchJsonAndParse(
			notificationListResponseSchema,
			`/v1/notifications?articleId=${articleId}`,
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

export const usePreviousNotifications = (articleId?: string) =>
	useQuery({
		queryKey: ['notifications', 'article', articleId],
		queryFn: () => fetchPreviousNotifications(articleId!),
		enabled: articleId !== undefined,
	});
