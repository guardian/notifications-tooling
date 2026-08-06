import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { CapiError, fetchArticleSummary } from './client';

afterEach(() => {
	mock.restore();
});

const capiPayload = {
	response: {
		status: 'ok',
		content: {
			id: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			webUrl:
				'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			sectionName: 'Environment',
			webPublicationDate: '2026-07-19T15:37:18Z',
			fields: {
				thumbnail: 'https://media.guim.co.uk/abc/500.jpg',
			},
		},
	},
};

describe('fetchArticleSummary', () => {
	it('resolves the summary fields from the CAPI response', async () => {
		const timeoutSignal = new AbortController().signal;
		const timeout = spyOn(AbortSignal, 'timeout').mockReturnValue(
			timeoutSignal,
		);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json(capiPayload),
		);

		const summary = await fetchArticleSummary({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			articleId:
				'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			timeoutMs: 10_000,
		});

		expect(summary).toEqual({
			articleId:
				'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			url: 'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			category: 'Environment',
			publishedAt: '2026-07-19T15:37:18Z',
			thumbnailUrl: 'https://media.guim.co.uk/abc/500.jpg',
		});
		expect(timeout).toHaveBeenCalledWith(10_000);
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://content.guardianapis.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures?api-key=test-key&show-fields=thumbnail',
			),
			{ signal: timeoutSignal },
		);
	});

	it('omits optional fields the response does not carry', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				response: {
					status: 'ok',
					content: {
						id: 'world/2026/jul/08/summit',
						webUrl: 'https://www.theguardian.com/world/2026/jul/08/summit',
						webPublicationDate: '2026-07-08T09:00:00Z',
					},
				},
			}),
		);

		const summary = await fetchArticleSummary({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			articleId: 'world/2026/jul/08/summit',
			timeoutMs: 10_000,
		});

		expect(summary).toEqual({
			articleId: 'world/2026/jul/08/summit',
			url: 'https://www.theguardian.com/world/2026/jul/08/summit',
			category: undefined,
			publishedAt: '2026-07-08T09:00:00Z',
			thumbnailUrl: undefined,
		});
	});

	it('classifies a 404 as not_found', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('not found', { status: 404 }),
		);

		expect(
			fetchArticleSummary({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/missing',
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'not_found' });
	});

	it('classifies other error statuses as unavailable', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('boom', { status: 500 }),
		);

		expect(
			fetchArticleSummary({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/summit',
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'unavailable' });
	});

	it('classifies network/timeout failures as unavailable', () => {
		const timeoutError = new Error('request timed out');
		timeoutError.name = 'TimeoutError';
		spyOn(globalThis, 'fetch').mockRejectedValue(timeoutError);

		expect(
			fetchArticleSummary({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/summit',
				timeoutMs: 10_000,
			}),
		).rejects.toBeInstanceOf(CapiError);
	});

	it('classifies malformed responses as invalid_response', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ response: { status: 'ok', content: {} } }),
		);

		expect(
			fetchArticleSummary({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/summit',
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'invalid_response' });
	});
});
