import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import type { ResolvedArticle } from '@models';
import { CapiError } from '@models';
import { fetchArticle, fetchLatestArticles } from './client';

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

const capiSearchResult = (index: number) => ({
	id: `world/2026/sep/16/article-${index}`,
	sectionName: 'World news',
	webPublicationDate: '2026-09-16T12:00:00.000Z',
	webTitle: `Article ${index}`,
	webUrl: `https://www.theguardian.com/world/2026/sep/16/article-${index}`,
	tags: [],
});

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
				'https://content.guardianapis.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures?api-key=test-key&show-fields=all&show-blocks=all',
			),
			{ signal: timeoutSignal },
		);
	});

	it('accepts block elements without image assets', async () => {
		const content = {
			...capiPayload.response.content,
			blocks: {
				main: {
					id: 'main-block',
					elements: [
						{ type: 'text', textTypeData: { html: '<p>Update</p>' } },
						{ type: 'image', imageTypeData: { alt: 'Update image' } },
						{
							type: 'image',
							assets: [{ typeData: { width: 500 } }],
						},
					],
				},
			},
		};
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ response: { status: 'ok', content } }),
		);

		const article = await fetchArticle({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			articleId: content.id,
			timeoutMs: 10_000,
		});

		expect(article).toEqual(content);
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
				'https://content.guardianapis.com/world/2026/jul/08/summit?api-key=test-key&show-fields=all&show-blocks=all',
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

describe('fetchLatestArticles', () => {
	it('requests and maps recent articles and liveblogs newest first', async () => {
		const timeoutSignal = new AbortController().signal;
		spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				response: {
					status: 'ok',
					pageSize: 200,
					results: [
						{
							id: 'world/2026/sep/15/older',
							sectionName: 'World news',
							webPublicationDate: '2026-09-15T15:00:00.000Z',
							webTitle: 'Older article',
							webUrl: 'https://www.theguardian.com/world/2026/sep/15/older',
							tags: [{ id: 'tracking/audience/global' }],
						},
						{
							id: 'uk-news/2026/sep/16/newer',
							type: 'liveblog',
							sectionName: 'UK news',
							webPublicationDate: '2026-09-16T12:00:00.000Z',
							webTitle: 'Newer article',
							webUrl: 'https://www.theguardian.com/uk-news/2026/sep/16/newer',
							fields: {
								headline: 'Newer article',
								productionOffice: 'UK',
								thumbnail: 'https://media.guim.co.uk/newer/500.jpg',
							},
							tags: [
								{ id: 'tracking/audience/uk' },
								{ id: 'tracking/audience/global' },
							],
						},
					],
				},
			}),
		);

		const articles = await fetchLatestArticles({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			fromDate: new Date('2026-09-15T13:03:00.000Z'),
			toDate: new Date('2026-09-16T13:03:00.000Z'),
			timeoutMs: 10_000,
		});

		expect(articles).toEqual([
			{
				webUrl: 'https://www.theguardian.com/uk-news/2026/sep/16/newer',
				publishedAt: '2026-09-16T12:00:00.000Z',
				headline: 'Newer article',
				section: 'UK news',
				thumbnail: 'https://media.guim.co.uk/newer/500.jpg',
				productionOffice: 'uk',
				intendedAudience: ['uk', 'global'],
			},
			{
				webUrl: 'https://www.theguardian.com/world/2026/sep/15/older',
				publishedAt: '2026-09-15T15:00:00.000Z',
				headline: 'Older article',
				section: 'World news',
				intendedAudience: ['global'],
			},
		]);
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://content.guardianapis.com/search?api-key=test-key&from-date=2026-09-15T13%3A03%3A00.000Z&to-date=2026-09-16T13%3A03%3A00.000Z&type=article%7Cliveblog&order-by=newest&page-size=200&show-fields=headline%2Cthumbnail%2CproductionOffice&show-tags=tracking',
			),
			{ signal: timeoutSignal },
		);
	});

	it('fetches every page using the last result as the cursor', async () => {
		const timeoutSignal = new AbortController().signal;
		spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal);
		const firstPageResults = Array.from({ length: 200 }, (_, index) =>
			capiSearchResult(index),
		);
		const fetcher = spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(
				Response.json({
					response: {
						status: 'ok',
						pageSize: 200,
						results: firstPageResults,
					},
				}),
			)
			.mockResolvedValueOnce(
				Response.json({
					response: {
						status: 'ok',
						pageSize: 200,
						results: [capiSearchResult(200)],
					},
				}),
			);

		const articles = await fetchLatestArticles({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			fromDate: new Date('2026-09-15T13:03:00.000Z'),
			toDate: new Date('2026-09-16T13:03:00.000Z'),
			timeoutMs: 10_000,
		});

		expect(articles).toHaveLength(201);
		expect(fetcher).toHaveBeenNthCalledWith(
			2,
			new URL(
				'https://content.guardianapis.com/content/world/2026/sep/16/article-199/next?api-key=test-key&from-date=2026-09-15T13%3A03%3A00.000Z&to-date=2026-09-16T13%3A03%3A00.000Z&type=article%7Cliveblog&order-by=newest&page-size=200&show-fields=headline%2Cthumbnail%2CproductionOffice&show-tags=tracking',
			),
			{ signal: timeoutSignal },
		);
	});

	it('classifies a failure while fetching a later page as unavailable', () => {
		const firstPageResults = Array.from({ length: 200 }, (_, index) =>
			capiSearchResult(index),
		);
		spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(
				Response.json({
					response: {
						status: 'ok',
						pageSize: 200,
						results: firstPageResults,
					},
				}),
			)
			.mockResolvedValueOnce(new Response(null, { status: 503 }));

		return expect(
			fetchLatestArticles({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				fromDate: new Date('2026-09-15T13:03:00.000Z'),
				toDate: new Date('2026-09-16T13:03:00.000Z'),
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'unavailable' });
	});

	it('skips results without a section or publication date', async () => {
		const result = {
			id: 'world/2026/sep/16/incomplete',
			webTitle: 'Incomplete article',
			webUrl: 'https://www.theguardian.com/world/2026/sep/16/incomplete',
			tags: [],
		};
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				response: {
					status: 'ok',
					pageSize: 200,
					results: [
						{ ...result, webPublicationDate: '2026-09-16T12:00:00.000Z' },
						{ ...result, sectionName: 'World news' },
					],
				},
			}),
		);

		const articles = await fetchLatestArticles({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			fromDate: new Date('2026-09-15T13:03:00.000Z'),
			toDate: new Date('2026-09-16T13:03:00.000Z'),
			timeoutMs: 10_000,
		});

		expect(articles).toEqual([]);
	});

	it('returns recognized intended audience regions', async () => {
		const result = (
			id: string,
			productionOffice?: 'UK' | 'US' | 'AUS',
			tags?: Array<{ id: string }>,
		) => ({
			id,
			sectionName: 'News',
			webPublicationDate: '2026-09-16T12:00:00.000Z',
			webTitle: id,
			webUrl: `https://www.theguardian.com/${id}`,
			fields: { headline: id, productionOffice },
			...(tags ? { tags } : {}),
		});
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				response: {
					status: 'ok',
					pageSize: 200,
					results: [
						result('uk', 'UK', [
							{ id: 'tracking/audience/global' },
							{ id: 'tracking/audience/uk' },
							{ id: 'tracking/audience/uk' },
						]),
						result('us', 'US', [{ id: 'tracking/audience/us' }]),
						result('au', 'AUS', [{ id: 'tracking/audience/au' }]),
						result('unknown', undefined, [
							{ id: 'tracking/commissioningdesk/news' },
						]),
						result('tags-omitted'),
					],
				},
			}),
		);

		const articles = await fetchLatestArticles({
			endpoint: 'https://content.guardianapis.com',
			apiKey: 'test-key',
			fromDate: new Date('2026-09-15T13:03:00.000Z'),
			toDate: new Date('2026-09-16T13:03:00.000Z'),
			timeoutMs: 10_000,
		});

		expect(
			articles.map(({ productionOffice, intendedAudience }) => ({
				productionOffice,
				intendedAudience,
			})),
		).toEqual([
			{ productionOffice: 'uk', intendedAudience: ['uk', 'global'] },
			{ productionOffice: 'us', intendedAudience: ['us'] },
			{ productionOffice: 'au', intendedAudience: ['au'] },
			{ productionOffice: undefined, intendedAudience: [] },
			{ productionOffice: undefined, intendedAudience: [] },
		]);
	});

	it('classifies a non-ok CAPI status as invalid_response', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				response: { status: 'error', pageSize: 200, results: [] },
			}),
		);

		return expect(
			fetchLatestArticles({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				fromDate: new Date('2026-09-15T13:03:00.000Z'),
				toDate: new Date('2026-09-16T13:03:00.000Z'),
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'invalid_response' });
	});

	it('classifies malformed search responses as invalid_response', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({
				response: {
					status: 'ok',
					pageSize: 200,
					results: [
						{
							id: 'world/2026/sep/16/invalid-date',
							sectionName: 'World news',
							webPublicationDate: 'not-a-date',
							webTitle: 'Invalid date',
							webUrl:
								'https://www.theguardian.com/world/2026/sep/16/invalid-date',
							tags: [],
						},
					],
				},
			}),
		);

		return expect(
			fetchLatestArticles({
				endpoint: 'https://content.guardianapis.com',
				apiKey: 'test-key',
				fromDate: new Date('2026-09-15T13:03:00.000Z'),
				toDate: new Date('2026-09-16T13:03:00.000Z'),
				timeoutMs: 10_000,
			}),
		).rejects.toMatchObject({ name: 'CapiError', reason: 'invalid_response' });
	});
});
