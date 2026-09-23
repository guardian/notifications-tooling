import { useQuery } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import { notificationListResponseSchema } from '../schemas';

export const fetchPreviousNotifications = async (articleId: string) =>
	await fetchJsonAndParse(
		notificationListResponseSchema,
		`/v1/notifications?articleId=${articleId}`,
	);

export const usePreviousNotifications = (articleId?: string) => {
	const query = useQuery({
		queryKey: ['notifications', 'article', articleId],
		queryFn: () => fetchPreviousNotifications(articleId!),
		enabled: articleId !== undefined,
		staleTime: 5000,
		refetchInterval: 5000,
	});

	return { ...query, articleId };
};
