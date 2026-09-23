import { expect, it } from 'bun:test';
import type { ResolveArticleResponse } from '@models';
import { act, createElement, useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../../happydom-setup';
import type { Result } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import { NotificationFormContext } from './NotificationFormContext';

it('reports a missing article resolver when no provider is present', async () => {
	const results: Array<Result<ResolveArticleResponse>> = [];
	const Consumer = () => {
		const { resolveArticleFromCapi } = useContext(NotificationFormContext);
		useEffect(() => {
			void resolveArticleFromCapi({
				article: 'https://www.theguardian.com/world/2026/sep/16/example',
			}).then((result) => {
				results.push(result);
			});
		}, [resolveArticleFromCapi]);
		return null;
	};
	const container = document.createElement('div');
	const root = createRoot(container);

	try {
		await act(async () => {
			root.render(createElement(Consumer));
			await Promise.resolve();
		});

		expect(results).toHaveLength(1);
		const result = results[0];
		if (!result || result.success) {
			throw new Error('Expected the missing resolver to return a failure');
		}
		expect(result.failure).toBeInstanceOf(ApiError);
		expect(result.failure.message).toBe(
			'no resolveArticleFromCapi implementation provided',
		);
		expect(result.failure.failure).toBe('fetch-fail');
	} finally {
		act(() => root.unmount());
	}
});
