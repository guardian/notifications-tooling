import { capiSearchResultSchema } from '@models';
import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { redirectToLogin } from '../api-client/redirectToLogin';
import { ALWAYS_FRESH } from './useNotificationHistory';

export const latestArticlesQueryKey = ['content', 'latest-articles'] as const;

export const fetchLatestArticles = () =>
	fetchJsonAndParse(capiSearchResultSchema, '/v1/content/articles/latest');

export const useLatestArticles = () =>
	useQuery({
		queryKey: latestArticlesQueryKey,
		queryFn: async () => {
			try {
				return await fetchLatestArticles();
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
		staleTime: ALWAYS_FRESH,
	});
