import { describe, expect, it } from 'bun:test';
import {
	parseArticleUrlInputToArticleId,
	parseImageSourceUrl,
} from './form-validation';

describe('parseArticleUrlInputToArticleId', () => {
	it('parses the id from a valid Guardian article link', () => {
		expect(
			parseArticleUrlInputToArticleId(
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			articleId: 'film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			webUrl:
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
		});
	});
	it('rejects non-guardian urls', () => {
		expect(
			parseArticleUrlInputToArticleId(
				'https://www.example.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			failure: 'not-guardian-url',
		});
	});
	it('accepts Guardian subdomains and short links', () => {
		expect(
			parseArticleUrlInputToArticleId(
				'https://amp.theguardian.com/world/2026/sep/08/article',
			),
		).toEqual({
			articleId: 'world/2026/sep/08/article',
			webUrl: 'https://amp.theguardian.com/world/2026/sep/08/article',
		});
		expect(parseArticleUrlInputToArticleId('https://gu.com/p/abc12')).toEqual({
			articleId: 'p/abc12',
			webUrl: 'https://gu.com/p/abc12',
		});
	});
	it('rejects non-https Guardian urls', () => {
		expect(
			parseArticleUrlInputToArticleId(
				'http://www.theguardian.com/world/2026/sep/08/article',
			),
		).toEqual({
			failure: 'not-guardian-url',
		});
	});
	it('preserves query params and hash', () => {
		expect(
			parseArticleUrlInputToArticleId(
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change?foo=bar&baz=foo#baz',
			),
		).toEqual({
			articleId: 'film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			webUrl:
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change?foo=bar&baz=foo#baz',
		});
	});
	it('rejects paths with only one components', () => {
		expect(
			parseArticleUrlInputToArticleId('https://www.theguardian.com/uk'),
		).toEqual({
			failure: 'incomplete-article-url',
		});
	});
	it('rejects paths with characters other than letters, numbers and dashes between in the segments', () => {
		expect(
			parseArticleUrlInputToArticleId(
				'https://www.theguardian.com/film/****/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			failure: 'incomplete-article-url',
		});
	});
	it('will accept an article id and use the default domain', () => {
		expect(
			parseArticleUrlInputToArticleId('global/2025/jan/02/my-headline'),
		).toEqual({
			articleId: 'global/2025/jan/02/my-headline',
			webUrl: 'https://www.theguardian.com/global/2025/jan/02/my-headline',
		});
	});
	it('will accept an article id with a leading slash', () => {
		expect(
			parseArticleUrlInputToArticleId('/global/2025/jan/02/my-headline'),
		).toEqual({
			articleId: 'global/2025/jan/02/my-headline',
			webUrl: 'https://www.theguardian.com/global/2025/jan/02/my-headline',
		});
	});
});

describe('parseImageSourceUrl', () => {
	const gridOrigin = 'https://grid.example.com';
	const imageId = '0123456789abcdef0123456789abcdef01234567';
	const cropId = '100_200_300_400';

	it('returns a failure without an error for an empty URL', () => {
		expect(parseImageSourceUrl('', gridOrigin)).toEqual({
			type: 'failure',
		});
	});

	it('accepts a valid Guardian image URL', () => {
		expect(
			parseImageSourceUrl(
				'https://media.guim.co.uk/84c162b73eb3b9ba1f72ae00b888a692216e0f68/442_0_4404_3525/1000.jpg',
				gridOrigin,
			),
		).toEqual({
			type: 'image-url',
		});
	});

	it('accepts a valid grid crop page URL and returns its details', () => {
		expect(
			parseImageSourceUrl(
				`${gridOrigin}/images/${imageId}?crop=${cropId}`,
				gridOrigin,
			),
		).toEqual({
			type: 'grid-url',
			cropId,
			imageId,
		});
	});

	it('uses the Guardian image error for an invalid non-grid URL', () => {
		expect(
			parseImageSourceUrl('https://example.com/image.jpg', gridOrigin),
		).toEqual({
			type: 'failure',
			validationError: 'Please enter a valid Guardian image URL',
		});
	});

	it('uses the grid validation error for a URL from the configured grid origin', () => {
		expect(
			parseImageSourceUrl(
				`${gridOrigin}/images/${imageId}?crop=100_200_300`,
				gridOrigin,
			),
		).toEqual({
			type: 'failure',
			validationError: 'Please enter the URL for a 5:4 crop page',
		});
	});

	it('reports when a grid URL is provided without grid configuration', () => {
		expect(
			parseImageSourceUrl(
				`${gridOrigin}/images/${imageId}?crop=${cropId}`,
				undefined,
			),
		).toEqual({
			type: 'failure',
			validationError: 'Please enter a valid Guardian image URL',
		});
	});
});
