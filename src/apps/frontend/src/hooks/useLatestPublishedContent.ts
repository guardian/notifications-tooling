import { useQuery } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import {
	type LatestPublishedContentItem,
	mockLatestPublishedContent,
} from '../latest-content/latest-published-content';

export const latestPublishedContentQueryKey = [
	'content',
	'latest-published',
] as const;

export const useLatestPublishedContent = (
	queryFn: () => Promise<LatestPublishedContentItem[]> = () =>
		Promise.resolve(mockLatestPublishedContent),
	queryKey: QueryKey = latestPublishedContentQueryKey,
) =>
	useQuery({
		queryKey,
		queryFn,
	});
