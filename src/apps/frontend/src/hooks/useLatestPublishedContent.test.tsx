import { afterEach, describe, expect, it, mock } from 'bun:test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import '../../happydom-setup';
import { useLatestPublishedContent } from './useLatestPublishedContent';

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe('useLatestPublishedContent', () => {
	it('fetches and maps the latest articles response', async () => {
		let requestUrl: URL | undefined;
		globalThis.fetch = mock((input: RequestInfo | URL) => {
			requestUrl = new URL(
				typeof input === 'string'
					? input
					: input instanceof URL
						? input.href
						: input.url,
			);
			return Promise.resolve(
				Response.json({
					articles: [
						{
							id: 'article-1',
							webUrl: 'https://www.theguardian.com/article-1',
							publishedAt: '2026-09-22T10:00:00.000Z',
							headline: 'A latest article',
							section: 'News',
							pillarId: 'pillar/news',
							pillarName: 'News',
							thumbnail: 'https://media.guim.co.uk/article-1.jpg',
							intendedAudience: ['uk', 'global'],
						},
					],
				}),
			);
		}) as unknown as typeof fetch;

		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result, unmount } = renderHook(() => useLatestPublishedContent(), {
			wrapper,
		});

		try {
			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(requestUrl?.pathname).toBe('/v1/content/articles/latest');
			expect(result.current.data).toEqual([
				{
					id: 'article-1',
					headline: 'A latest article',
					url: 'https://www.theguardian.com/article-1',
					imageUrl: 'https://media.guim.co.uk/article-1.jpg',
					section: 'News',
					pillarName: 'News',
					pillarId: 'pillar/news',
					publishedAt: '2026-09-22T10:00:00.000Z',
					tags: [
						{ path: 'tracking/audience/uk' },
						{ path: 'tracking/audience/global' },
					],
				},
			]);
		} finally {
			// Unmounting is what tears down the 30s poll; removeQueries only
			// clears the cache and would leave the interval armed.
			unmount();
		}
	});
});
