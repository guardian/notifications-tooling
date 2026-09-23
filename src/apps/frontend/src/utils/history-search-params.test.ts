import { describe, expect, it } from 'bun:test';
import { newsletterSegmentId } from '@models';
import {
	parseHistorySearchParams,
	updateHistoryFilters,
} from './history-search-params';

describe('parseHistorySearchParams', () => {
	it('uses history defaults when pagination is absent', () => {
		expect(parseHistorySearchParams(new URLSearchParams())).toEqual({
			limit: 20,
			offset: 0,
			since: undefined,
		});
	});

	it('reads valid endpoint pagination and since parameters', () => {
		expect(
			parseHistorySearchParams(
				new URLSearchParams(
					'limit=10&offset=20&since=1700000000&search=%20climate%20',
				),
			),
		).toEqual({
			limit: 10,
			offset: 20,
			since: 1_700_000_000,
			search: 'climate',
		});
	});

	it('reads, validates, and deduplicates audience parameters', () => {
		expect(
			parseHistorySearchParams(
				new URLSearchParams(
					'audience=uk&audience=UK&audience=europe&audience=invalid',
				),
			),
		).toEqual({
			limit: 20,
			offset: 0,
			since: undefined,
			audiences: ['uk', 'europe'],
		});
	});

	it('accepts every newsletter segment as a canonical lowercase filter', () => {
		const searchParams = new URLSearchParams();
		for (const segment of newsletterSegmentId.options) {
			searchParams.append('audience', segment.toLowerCase());
		}

		expect(parseHistorySearchParams(searchParams).audiences).toEqual(
			newsletterSegmentId.options.map((segment) => segment.toLowerCase()),
		);
	});

	it('reads, validates, and deduplicates status parameters', () => {
		expect(
			parseHistorySearchParams(
				new URLSearchParams(
					'status=error&status=sent&status=error&status=invalid',
				),
			),
		).toEqual({
			limit: 20,
			offset: 0,
			since: undefined,
			statuses: ['sent', 'error'],
		});
	});

	it('sanitizes invalid values before they reach the endpoint', () => {
		expect(
			parseHistorySearchParams(
				new URLSearchParams('limit=51&offset=-1&since=invalid'),
			),
		).toEqual({ limit: 20, offset: 0, since: undefined });
	});

	it('omits blank and overlong search values', () => {
		expect(
			parseHistorySearchParams(new URLSearchParams('search=%20%20')),
		).not.toHaveProperty('search');
		expect(
			parseHistorySearchParams(
				new URLSearchParams({ search: 'a'.repeat(201) }),
			),
		).not.toHaveProperty('search');
	});

	it('canonicalizes repeated categories without dropping invalid IDs', () => {
		expect(
			parseHistorySearchParams(
				new URLSearchParams(
					'search=election&alertType=sport&alertType=exclusive&alertType=sport',
				),
			),
		).toMatchObject({ search: 'election', alertTypes: ['exclusive', 'sport'] });
		expect(
			parseHistorySearchParams(
				new URLSearchParams('alertType=sport&alertType=&alertType=unknown'),
			),
		).toMatchObject({ alertTypes: ['', 'sport', 'unknown'] });
	});
});

describe('updateHistoryFilters', () => {
	const original =
		'search=election&alertType=sport&alertType=exclusive&offset=20&limit=10&since=1700000000&other=keep';

	it('changes categories immediately, preserving search and other URL state', () => {
		const current = new URLSearchParams(original);
		const next = updateHistoryFilters(current, {
			alertTypes: ['sport', 'breaking-news', 'sport'],
		});
		expect(next.getAll('alertType')).toEqual(['breaking-news', 'sport']);
		expect(Object.fromEntries(next)).toMatchObject({
			search: 'election',
			offset: '0',
			limit: '10',
			since: '1700000000',
			other: 'keep',
		});
		expect(current.get('offset')).toBe('20');
	});

	it('preserves categories while typing, including invalid values', () => {
		const current = new URLSearchParams(`${original}&alertType=`);
		const next = updateHistoryFilters(current, { search: 'latest' });
		expect(next.getAll('alertType')).toEqual(['', 'exclusive', 'sport']);
		expect(next.get('search')).toBe('latest');
		expect(next.get('offset')).toBe('0');
	});

	it('removes categories without changing search or unrelated URL state', () => {
		const next = updateHistoryFilters(
			new URLSearchParams(`${original}&alertType=`),
			{ alertTypes: [] },
		);
		expect(next.has('alertType')).toBe(false);
		expect(Object.fromEntries(next)).toEqual({
			search: 'election',
			offset: '0',
			limit: '10',
			since: '1700000000',
			other: 'keep',
		});
	});

	it('removes search without changing categories or unrelated URL state', () => {
		const next = updateHistoryFilters(new URLSearchParams(original), {
			search: '',
		});
		expect(next.has('search')).toBe(false);
		expect(next.getAll('alertType')).toEqual(['exclusive', 'sport']);
		expect(Object.fromEntries(next)).toMatchObject({
			offset: '0',
			limit: '10',
			since: '1700000000',
			other: 'keep',
		});
	});
});
