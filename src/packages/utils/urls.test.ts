import { describe, expect, it } from 'bun:test';
import { determineArticleId } from './urls';

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
