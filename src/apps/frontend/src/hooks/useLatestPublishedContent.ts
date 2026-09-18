import { useQuery } from '@tanstack/react-query';
import { mockLatestPublishedContent } from '../latest-content/latest-published-content';

export const latestPublishedContentQueryKey = [
	'content',
	'latest-published',
] as const;

/**
 * Static mock data behind a query today; shaped so a real endpoint can
 * replace the queryFn later without changing any consuming component.
 */
export const useLatestPublishedContent = () =>
	useQuery({
		queryKey: latestPublishedContentQueryKey,
		queryFn: () => Promise.resolve(mockLatestPublishedContent),
	});
