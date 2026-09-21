import { useQuery } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import type { LatestPublishedContentItem } from '../latest-content/latest-published-content';

export const latestPublishedContentQueryKey = [
	'content',
	'latest-published',
] as const;

export const useLatestPublishedContent = (
	queryFn: () => Promise<LatestPublishedContentItem[]> = () =>
		new Promise<LatestPublishedContentItem[]>(() => undefined),
	queryKey: QueryKey = latestPublishedContentQueryKey,
) =>
	useQuery({
		queryKey,
		queryFn,
	});
