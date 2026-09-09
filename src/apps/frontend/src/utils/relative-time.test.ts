import { describe, expect, it } from 'bun:test';
import {
	formatRelativeTime,
	getRefreshIntervalMs,
	isRelativeTime,
	parsePublicationDate,
} from './relative-time';

const TEST_DATE = new Date('2026-07-19T12:00:00Z');
const minutesAgo = (minutes: number) =>
	new Date(TEST_DATE.getTime() - minutes * 60 * 1000);
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

describe('formatRelativeTime', () => {
	it('describes the last minute as "just now"', () => {
		expect(formatRelativeTime(minutesAgo(0), TEST_DATE)).toBe('just now');
		expect(
			formatRelativeTime(new Date(TEST_DATE.getTime() - 59_000), TEST_DATE),
		).toBe('just now');
	});

	it('counts whole minutes', () => {
		expect(formatRelativeTime(minutesAgo(2), TEST_DATE)).toBe('2m ago');
		expect(formatRelativeTime(minutesAgo(59), TEST_DATE)).toBe('59m ago');
	});

	it('rounds down to the minute', () => {
		const twoAndAHalfMinutes = new Date(TEST_DATE.getTime() - 150_000);
		expect(formatRelativeTime(twoAndAHalfMinutes, TEST_DATE)).toBe('2m ago');
	});

	it('counts whole hours', () => {
		expect(formatRelativeTime(hoursAgo(1), TEST_DATE)).toBe('1h ago');
		expect(formatRelativeTime(hoursAgo(23), TEST_DATE)).toBe('23h ago');
	});

	it('supports long relative labels', () => {
		expect(
			formatRelativeTime(
				new Date(TEST_DATE.getTime() - 999),
				TEST_DATE,
				'long',
			),
		).toBe('just now');
		expect(
			formatRelativeTime(
				new Date(TEST_DATE.getTime() - 1_000),
				TEST_DATE,
				'long',
			),
		).toBe('1 sec ago');
		expect(formatRelativeTime(hoursAgo(1), TEST_DATE, 'long')).toBe(
			'1 hour ago',
		);
		expect(
			formatRelativeTime(
				new Date(TEST_DATE.getTime() - 42_000),
				TEST_DATE,
				'long',
			),
		).toBe('42 secs ago');
	});

	it('falls back to a full absolute time at exactly 24 hours', () => {
		expect(formatRelativeTime(daysAgo(1), TEST_DATE)).toBe(
			'18 Jul 2026, 13:00',
		);
		expect(formatRelativeTime(daysAgo(400), TEST_DATE)).toBe(
			'14 Jun 2025, 13:00',
		);
	});

	it('falls back to an absolute date for future publication dates', () => {
		const tomorrow = new Date(TEST_DATE.getTime() + 24 * 60 * 60 * 1000);
		expect(formatRelativeTime(tomorrow, TEST_DATE)).toBe('20 Jul 2026, 13:00');
	});
});

describe('isRelativeTime', () => {
	it('is true only for timestamps within the past 24 hours', () => {
		expect(isRelativeTime(hoursAgo(23), TEST_DATE)).toBe(true);
		expect(isRelativeTime(daysAgo(1), TEST_DATE)).toBe(false);
		expect(
			isRelativeTime(new Date(TEST_DATE.getTime() + 1_000), TEST_DATE),
		).toBe(false);
	});
});

describe('parsePublicationDate', () => {
	it('parses an ISO 8601 timestamp', () => {
		expect(parsePublicationDate('2026-07-19T15:37:18Z')?.toISOString()).toBe(
			'2026-07-19T15:37:18.000Z',
		);
	});

	it('returns undefined when there is no timestamp', () => {
		expect(parsePublicationDate(undefined)).toBeUndefined();
		expect(parsePublicationDate('')).toBeUndefined();
	});

	it('returns undefined for an unparseable timestamp', () => {
		expect(parsePublicationDate('not-a-date')).toBeUndefined();
	});
});

describe('getRefreshIntervalMs', () => {
	it('ticks every 30 seconds while counting minutes', () => {
		expect(getRefreshIntervalMs(minutesAgo(2), TEST_DATE)).toBe(30_000);
	});

	it('ticks every 5 minutes once counting hours', () => {
		expect(getRefreshIntervalMs(hoursAgo(3), TEST_DATE)).toBe(300_000);
	});

	it('ticks every second while long labels count seconds', () => {
		expect(getRefreshIntervalMs(minutesAgo(0), TEST_DATE, 'long')).toBe(1_000);
	});

	it('ticks at the exact 24-hour boundary', () => {
		expect(getRefreshIntervalMs(minutesAgo(24 * 60 - 1), TEST_DATE)).toBe(
			60_000,
		);
	});

	it('stops ticking once the label is an absolute date', () => {
		expect(getRefreshIntervalMs(daysAgo(1), TEST_DATE)).toBeUndefined();
		expect(
			getRefreshIntervalMs(new Date(TEST_DATE.getTime() + 60_000), TEST_DATE),
		).toBeUndefined();
	});
});
