import { articlePreviousSendsResponseSchema } from '@models';
import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirect-to-login';

export const fetchPreviousNotifications = async (articleId: string) => {
	try {
		return await fetchJsonAndParse(
			articlePreviousSendsResponseSchema,
			`/v1/notifications/article/${encodeURIComponent(articleId)}`,
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
