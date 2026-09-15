import { describe, expect, it } from 'bun:test';
import { determineArticleId, determineBlockId } from './urls';

describe('determineArticleId', () => {
	it('accepts a bare CAPI article id', () => {
		expect(determineArticleId('environment/2026/jul/19/a-headline')).toBe(
			'environment/2026/jul/19/a-headline',
		);
	});

	it('trims surrounding whitespace and leading/trailing slashes', () => {
		expect(determineArticleId('  /environment/2026/jul/19/a-headline/  ')).toBe(
			'environment/2026/jul/19/a-headline',
		);
	});

	it('extracts the id from a public front-end URL', () => {
		expect(
			determineArticleId(
				'https://www.theguardian.com/environment/2026/jul/19/a-headline',
			),
		).toBe('environment/2026/jul/19/a-headline');
	});

	it('ignores query string and hash', () => {
		expect(
			determineArticleId(
				'https://www.theguardian.com/environment/2026/jul/19/a-headline?utm=x#comments',
			),
		).toBe('environment/2026/jul/19/a-headline');
	});

	it('extracts the id from an internal gutools preview/viewer URL', () => {
		expect(
			determineArticleId(
				'https://viewer.gutools.co.uk/environment/2026/jul/19/a-headline',
			),
		).toBe('environment/2026/jul/19/a-headline');
	});

	it('extracts the id from an amp URL', () => {
		expect(
			determineArticleId(
				'https://amp.theguardian.com/environment/2026/jul/19/a-headline',
			),
		).toBe('environment/2026/jul/19/a-headline');
	});

	it('rejects a path with fewer than two segments', () => {
		expect(
			determineArticleId('https://www.theguardian.com/uk'),
		).toBeUndefined();
		expect(determineArticleId('uk')).toBeUndefined();
	});

	it('rejects a non-http(s) scheme', () => {
		expect(
			determineArticleId('mailto:someone@theguardian.com'),
		).toBeUndefined();
	});

	it('rejects an empty string', () => {
		expect(determineArticleId('')).toBeUndefined();
		expect(determineArticleId('   ')).toBeUndefined();
	});
});

describe('determineBlockId', () => {
	it('extracts the block id from a `page=with:block-` query', () => {
		expect(
			determineBlockId(
				'https://www.theguardian.com/politics/live/2026/jul/19/election-live?page=with:block-5dd7ca0f8f080fd59fb15354',
			),
		).toBe('5dd7ca0f8f080fd59fb15354');
	});

	it('extracts the block id when a matching hash is also present', () => {
		expect(
			determineBlockId(
				'https://www.theguardian.com/politics/live/2026/jul/19/election-live?page=with:block-abc123#block-abc123',
			),
		).toBe('abc123');
	});

	it('falls back to a `#block-` fragment when there is no page query', () => {
		expect(
			determineBlockId(
				'https://www.theguardian.com/politics/live/2026/jul/19/election-live#block-abc123',
			),
		).toBe('abc123');
	});

	it('returns undefined for a link without a block reference', () => {
		expect(
			determineBlockId(
				'https://www.theguardian.com/environment/2026/jul/19/a-headline?utm=x',
			),
		).toBeUndefined();
	});

	it('returns undefined for a non-block `page` query', () => {
		expect(
			determineBlockId(
				'https://www.theguardian.com/politics/live/2026/jul/19/election-live?page=with:block',
			),
		).toBeUndefined();
	});

	it('returns undefined for a bare article id or non-http(s) input', () => {
		expect(
			determineBlockId('environment/2026/jul/19/a-headline'),
		).toBeUndefined();
		expect(determineBlockId('mailto:someone@theguardian.com')).toBeUndefined();
		expect(determineBlockId('')).toBeUndefined();
	});
});
