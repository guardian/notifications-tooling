import { describe, expect, it } from 'bun:test';
import { newsletterSegmentId } from '@models';
import { parseHistorySearchParams } from './history-search-params';

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
});
