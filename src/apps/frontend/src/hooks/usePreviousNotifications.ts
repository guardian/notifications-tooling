import { useQuery } from '@tanstack/react-query';
import z from 'zod';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirect-to-login';

export type PreviousSend = {
	notificationId: string;
	sentBy: string;
	sentAt: string;
	channels: Array<'app-push' | 'newsletter'>;
};

export const fetchPreviousNotifications = async (articleId: string) => {
	try {
		return await fetchJsonAndParse(
			z.unknown(), // TO DO - get the schema for the endpoint
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
