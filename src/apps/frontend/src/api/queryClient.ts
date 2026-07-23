import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './errors';

/** Queries retry network/timeout errors and 5xx responses; everything else (4xx, schema drift) is not transient. */
const isRetryableQueryFailure = (error: unknown): boolean => {
	if (!(error instanceof ApiError)) {
		return false;
	}
	if (error.failure === 'fetch-fail' || error.failure === 'timeout') {
		return true;
	}
	return error.failure === 'non-2xx-response' && (error.status ?? 0) >= 500;
};

const MAX_QUERY_RETRIES = 3;

/**
 * Shared TanStack Query client. Mutations never auto-retry so a send can't silently fire twice.
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) =>
				failureCount < MAX_QUERY_RETRIES && isRetryableQueryFailure(error),
		},
		mutations: {
			retry: false,
		},
	},
});
