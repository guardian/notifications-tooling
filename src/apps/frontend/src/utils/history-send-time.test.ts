import { describe, expect, it } from 'bun:test';
import { formatLocalSendTimes } from './history-send-time';

describe('formatLocalSendTimes', () => {
	it('converts a summer send time into each region local time', () => {
		expect(formatLocalSendTimes('2026-06-15T09:21:00Z')).toEqual([
			{ region: 'UK', time: '10:21 BST' },
			{ region: 'US', time: '05:21 EDT' },
			{ region: 'AU', time: '19:21 AEST' },
			{ region: 'EU', time: '11:21 CEST' },
		]);
	});

	it('converts a winter send time into each region local time', () => {
		expect(formatLocalSendTimes('2026-01-15T09:21:00Z')).toEqual([
			{ region: 'UK', time: '09:21 GMT' },
			{ region: 'US', time: '04:21 EST' },
			{ region: 'AU', time: '20:21 AEDT' },
			{ region: 'EU', time: '10:21 CET' },
		]);
	});

	it('returns no times for an invalid timestamp', () => {
		expect(formatLocalSendTimes('not-a-date')).toEqual([]);
	});
});
