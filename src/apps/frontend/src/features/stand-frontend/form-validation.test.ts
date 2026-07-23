import { describe, expect, it } from 'bun:test';
import { parseArticleUrlInputToContentId } from './form-validation';

describe('parseArticleUrlInputToContentId', () => {
	it('parses the id from a valid Guardian article link', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			articleId: 'film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
		});
	});
	it('rejects non-guardian urls', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://www.example.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			failure: 'not a Guardian URL',
		});
	});
	it('ignores query params and hash', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change?foo=bar&baz=foo#baz',
			),
		).toEqual({
			articleId: 'film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
		});
	});
	it('rejects paths with only one components', () => {
		expect(
			parseArticleUrlInputToContentId('https://www.theguardian.com/uk'),
		).toEqual({
			failure: 'not a Guardian article URL',
		});
	});
	it('rejects paths with characters other than letters, numbers and dashes between in the segments', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://www.theguardian.com/film/****/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			failure: 'not a Guardian article URL',
		});
	});
	it('will accept an article id', () => {
		expect(
			parseArticleUrlInputToContentId('global/2025/jan/02/my-headline'),
		).toEqual({
			articleId: 'global/2025/jan/02/my-headline',
		});
	});
	it('will accept an article id with a leading slash', () => {
		expect(
			parseArticleUrlInputToContentId('/global/2025/jan/02/my-headline'),
		).toEqual({
			articleId: 'global/2025/jan/02/my-headline',
		});
	});
});
