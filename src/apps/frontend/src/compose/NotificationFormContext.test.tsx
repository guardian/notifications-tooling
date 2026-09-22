import { expect, it } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { useContext } from 'react';
import { ApiError } from '../api-client/errors';
import { NotificationFormContext } from './NotificationFormContext';

it('reports a missing article resolver when no provider is present', async () => {
	const { result } = renderHook(() => useContext(NotificationFormContext));

	const outcome = await result.current.resolveArticleFromCapi({
		article: 'https://www.theguardian.com/world/2026/sep/16/example',
	});

	if (outcome.success) {
		throw new Error('Expected the missing resolver to return a failure');
	}
	expect(outcome.failure).toBeInstanceOf(ApiError);
	expect(outcome.failure.message).toBe(
		'no resolveArticleFromCapi implementation provided',
	);
	expect(outcome.failure.failure).toBe('fetch-fail');
});
