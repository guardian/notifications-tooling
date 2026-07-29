import { describe, expect, it } from 'bun:test';
import { ApiError } from './errors';
import { queryClient } from './queryClient';

/**
 * Exercised through the configured client's default options rather than the
 * predicate itself, so the test asserts what TanStack will actually do.
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
	const retry = queryClient.getDefaultOptions().queries?.retry;
	if (typeof retry !== 'function') {
		throw new Error('queries.retry is expected to be a predicate');
	}
	return retry(failureCount, error as Error);
};

const apiError = (failure: ApiError['failure'], status?: number): ApiError =>
	new ApiError({ message: 'nope', failure, status });

describe('queryClient retry policy', () => {
	it('retries transient network and timeout failures', () => {
		expect(shouldRetry(0, apiError('fetch-fail'))).toBe(true);
		expect(shouldRetry(0, apiError('timeout'))).toBe(true);
	});

	it('retries 5xx responses but not 4xx', () => {
		expect(shouldRetry(0, apiError('non-2xx-response', 503))).toBe(true);
		expect(shouldRetry(0, apiError('non-2xx-response', 422))).toBe(false);
	});

	it('does not retry an expired session', () => {
		// The redirect to login has already been triggered; retrying would burn
		// three requests and report the wrong cause.
		expect(shouldRetry(0, apiError('unauthenticated', 401))).toBe(false);
	});

	it('does not retry a permissions failure', () => {
		// Retrying cannot grant a permission the user does not have.
		expect(shouldRetry(0, apiError('forbidden', 403))).toBe(false);
	});

	it('does not retry schema drift', () => {
		expect(shouldRetry(0, apiError('schema-parse-fail'))).toBe(false);
	});

	it('gives up after three attempts', () => {
		expect(shouldRetry(2, apiError('fetch-fail'))).toBe(true);
		expect(shouldRetry(3, apiError('fetch-fail'))).toBe(false);
	});

	it('never retries mutations, so a send cannot silently fire twice', () => {
		expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
	});
});
