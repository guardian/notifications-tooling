import { expect, it } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { useContext } from 'react';
import '../../happydom-setup';
import { ApiError } from '../api-client/errors';
import { NotificationFormContext } from './NotificationFormContext';

it('reports a missing article resolver when no provider is present', async () => {
	const { result: context } = renderHook(() =>
		useContext(NotificationFormContext),
	);
	const result = await context.current.resolveArticleFromCapi({
		article: 'https://www.theguardian.com/world/2026/sep/16/example',
	});
	if (result.success) {
		throw new Error('Expected the missing resolver to return a failure');
	}
	expect(result.failure).toBeInstanceOf(ApiError);
	expect(result.failure.message).toBe(
		'no resolveArticleFromCapi implementation provided',
	);
	expect(result.failure.failure).toBe('fetch-fail');
});
