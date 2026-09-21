import { latestArticlesResponseSchema } from '@models';
import { useQuery } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { fetchJsonAndParse } from '../api-client/client';
import {
	type LatestPublishedContentItem,
	mapLatestArticleToContentItem,
} from '../latest-content/latest-published-content';

export const latestPublishedContentQueryKey = [
	'content',
	'latest-published',
] as const;

const fetchLatestPublishedContent = async (): Promise<
	LatestPublishedContentItem[]
> => {
	const { articles } = await fetchJsonAndParse(
		latestArticlesResponseSchema,
		'/v1/content/articles/latest',
	);
	return articles.map(mapLatestArticleToContentItem);
};

export const useLatestPublishedContent = (
	queryFn: () => Promise<
		LatestPublishedContentItem[]
	> = fetchLatestPublishedContent,
	queryKey: QueryKey = latestPublishedContentQueryKey,
) =>
	useQuery({
		queryKey,
		queryFn,
	});
