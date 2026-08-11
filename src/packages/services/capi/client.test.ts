import type { ResolvedArticle } from '@models';
import { CapiError } from '@models';
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { fetchArticle } from './client';

afterEach(() => {
	mock.restore();
});

const capiPayload = {
	response: {
		status: 'ok',
		content: {
			id: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
			type: 'article',
			sectionId: 'environment',
			sectionName: 'Environment',
			webPublicationDate: '2026-07-19T15:37:18Z',
			webTitle: 'A rhyme to recall rising temperatures',
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
	it('returns the full CAPI content item verbatim', async () => {
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
			timeoutMs: 10_000,
		});

		expect(article).toEqual(capiPayload.response.content);
		expect(timeout).toHaveBeenCalledWith(10_000);
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://content.guardianapis.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures?api-key=test-key&show-fields=all',
			),
			{ signal: timeoutSignal },
		);
	});

	it('encodes the article id path segments in the CAPI request', async () => {
		const timeoutSignal = new AbortController().signal;
		spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal);
		const content: ResolvedArticle = {
			id: 'world/2026/jul/08/summit',
			type: 'article',
			webUrl: 'https://www.theguardian.com/world/2026/jul/08/summit',
			webTitle: 'summit happen',
			fields: {
				headline: 'summit happen',
			},
		};
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ response: { status: 'ok', content } }),
		);

		const article = await fetchArticle({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			articleId: 'world/2026/jul/08/summit',
			timeoutMs: 10_000,
		});

		expect(article).toEqual(content);
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://content.guardianapis.com/world/2026/jul/08/summit?api-key=test-key&show-fields=all',
			),
			{ signal: timeoutSignal },
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
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'invalid_response' });
	});
});
