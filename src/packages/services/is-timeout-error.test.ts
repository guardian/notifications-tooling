import { describe, expect, it } from 'bun:test';
import { isTimeoutError } from './is-timeout-error';

describe('isTimeoutError', () => {
	it.each(['AbortError', 'TimeoutError'])('recognizes %s', (name) => {
		const error = new Error('request timed out');
		error.name = name;

		expect(isTimeoutError(error)).toBe(true);
	});

	it.each([new Error('network failed'), 'TimeoutError', undefined])(
		'rejects non-timeout input %#',
		(error) => {
			expect(isTimeoutError(error)).toBe(false);
		},
	);
});
