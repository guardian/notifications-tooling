import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { CapiError, fetchArticle } from './client';

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
			fields: {
				headline: 'A rhyme to recall rising temperatures',
				thumbnail: 'https://media.guim.co.uk/abc/500.jpg',
			},
		},
	},
};

describe('fetchArticle', () => {
	it('resolves the id, url and requested show-fields', async () => {
		const timeoutSignal = new AbortController().signal;
		const timeout = spyOn(AbortSignal, 'timeout').mockReturnValue(
			timeoutSignal,
		);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json(capiPayload),
		);

		const article = await fetchArticle({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			articleId:
				'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			fields: ['headline', 'thumbnail'],
			timeoutMs: 10_000,
		});

		expect(article).toEqual({
			articleId:
				'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			url: 'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			fields: {
				headline: 'A rhyme to recall rising temperatures',
				thumbnail: 'https://media.guim.co.uk/abc/500.jpg',
			},
		});
		expect(timeout).toHaveBeenCalledWith(10_000);
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://content.guardianapis.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures?api-key=test-key&show-fields=headline%2Cthumbnail',
			),
			{ signal: timeoutSignal },
		);
	});

	it('omits show-fields and returns empty fields when none are requested', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				response: {
					status: 'ok',
					content: {
						id: 'world/2026/jul/08/summit',
						webUrl: 'https://www.theguardian.com/world/2026/jul/08/summit',
					},
				},
			}),
		);

		const article = await fetchArticle({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			articleId: 'world/2026/jul/08/summit',
			fields: [],
			timeoutMs: 10_000,
		});

		expect(article).toEqual({
			articleId: 'world/2026/jul/08/summit',
			url: 'https://www.theguardian.com/world/2026/jul/08/summit',
			fields: {},
		});
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://content.guardianapis.com/world/2026/jul/08/summit?api-key=test-key',
			),
			{ signal: expect.anything() },
		);
	});

	it('classifies a 404 as not_found', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('not found', { status: 404 }),
		);

		expect(
			fetchArticle({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/missing',
				fields: [],
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'not_found' });
	});

	it('classifies other error statuses as unavailable', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('boom', { status: 500 }),
		);

		expect(
			fetchArticle({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/summit',
				fields: [],
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'unavailable' });
	});

	it('classifies network/timeout failures as unavailable', () => {
		const timeoutError = new Error('request timed out');
		timeoutError.name = 'TimeoutError';
		spyOn(globalThis, 'fetch').mockRejectedValue(timeoutError);

		expect(
			fetchArticle({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/summit',
				fields: [],
				timeoutMs: 10_000,
			}),
		).rejects.toBeInstanceOf(CapiError);
	});

	it('classifies malformed responses as invalid_response', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ response: { status: 'ok', content: {} } }),
		);

		expect(
			fetchArticle({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				articleId: 'world/2026/jul/08/summit',
				fields: [],
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'invalid_response' });
	});
});
