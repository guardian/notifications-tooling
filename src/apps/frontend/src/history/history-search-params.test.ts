import { describe, expect, it } from 'bun:test';
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
				new URLSearchParams('limit=10&offset=20&since=1700000000'),
			),
		).toEqual({ limit: 10, offset: 20, since: 1_700_000_000 });
	});

	it('sanitizes invalid values before they reach the endpoint', () => {
		expect(
			parseHistorySearchParams(
				new URLSearchParams('limit=51&offset=-1&since=invalid'),
			),
		).toEqual({ limit: 20, offset: 0, since: undefined });
	});
});
