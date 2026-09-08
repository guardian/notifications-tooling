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
			webUrl:
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
		});
	});
	it('rejects non-guardian urls', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://www.example.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			failure: 'not-guardian-url',
		});
	});
	it('accepts Guardian subdomains and short links', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://amp.theguardian.com/world/2026/sep/08/article',
			),
		).toEqual({
			articleId: 'world/2026/sep/08/article',
			webUrl: 'https://amp.theguardian.com/world/2026/sep/08/article',
		});
		expect(parseArticleUrlInputToContentId('https://gu.com/p/abc12')).toEqual({
			articleId: 'p/abc12',
			webUrl: 'https://gu.com/p/abc12',
		});
	});
	it('rejects non-https Guardian urls', () => {
		expect(
			parseArticleUrlInputToContentId(
				'http://www.theguardian.com/world/2026/sep/08/article',
			),
		).toEqual({
			failure: 'not-guardian-url',
		});
	});
	it('ignores query params and hash', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change?foo=bar&baz=foo#baz',
			),
		).toEqual({
			articleId: 'film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			webUrl:
				'https://www.theguardian.com/film/2026/jul/23/ryan-gosling-hand-la-la-land-poster-change',
		});
	});
	it('rejects paths with only one components', () => {
		expect(
			parseArticleUrlInputToContentId('https://www.theguardian.com/uk'),
		).toEqual({
			failure: 'incomplete-article-url',
		});
	});
	it('rejects paths with characters other than letters, numbers and dashes between in the segments', () => {
		expect(
			parseArticleUrlInputToContentId(
				'https://www.theguardian.com/film/****/jul/23/ryan-gosling-hand-la-la-land-poster-change',
			),
		).toEqual({
			failure: 'incomplete-article-url',
		});
	});
	it('will accept an article id and use the default domain', () => {
		expect(
			parseArticleUrlInputToContentId('global/2025/jan/02/my-headline'),
		).toEqual({
			articleId: 'global/2025/jan/02/my-headline',
			webUrl: 'https://www.theguardian.com/global/2025/jan/02/my-headline',
		});
	});
	it('will accept an article id with a leading slash', () => {
		expect(
			parseArticleUrlInputToContentId('/global/2025/jan/02/my-headline'),
		).toEqual({
			articleId: 'global/2025/jan/02/my-headline',
			webUrl: 'https://www.theguardian.com/global/2025/jan/02/my-headline',
		});
	});
});
