const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const absoluteDateFormatter = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'medium',
	timeZone: 'Europe/London',
});

const absoluteTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	timeStyle: 'short',
	timeZone: 'Europe/London',
});

export type RelativeTimeStyle = 'short' | 'long';

/**
 * Parses a CAPI `iso8601` publication date, returning `undefined` when the
 * value is missing or unparseable so callers can hide the date entirely.
 */
export const parsePublicationDate = (iso8601?: string): Date | undefined => {
	if (!iso8601) {
		return undefined;
	}
	const date = new Date(iso8601);
	return Number.isNaN(date.getTime()) ? undefined : date;
};

/**
 * Whether a date is within the past 24 hours and should use a relative label.
 */
export const isRelativeTime = (date: Date, now: Date = new Date()): boolean => {
	const elapsedMs = now.getTime() - date.getTime();
	return elapsedMs >= 0 && elapsedMs < DAY_MS;
};

const longRelativeLabel = (amount: number, unit: string) =>
	`${amount} ${unit}${amount === 1 ? '' : 's'} ago`;

/**
 * Formats a date relative to now. Dates at least 24 hours old, and future
 * dates, use a full absolute date and time.
 */
export const formatRelativeTime = (
	date: Date,
	now: Date = new Date(),
	style: RelativeTimeStyle = 'short',
): string => {
	const elapsedMs = now.getTime() - date.getTime();

	if (!isRelativeTime(date, now)) {
		return formatAbsoluteTime(date);
	}
	if (elapsedMs < SECOND_MS) {
		return 'just now';
	}
	if (elapsedMs < MINUTE_MS) {
		return style === 'long'
			? longRelativeLabel(Math.floor(elapsedMs / SECOND_MS), 'sec')
			: 'just now';
	}
	if (elapsedMs < HOUR_MS) {
		const minutes = Math.floor(elapsedMs / MINUTE_MS);
		return style === 'long'
			? longRelativeLabel(minutes, 'min')
			: `${minutes}m ago`;
	}
	const hours = Math.floor(elapsedMs / HOUR_MS);
	return style === 'long' ? longRelativeLabel(hours, 'hour') : `${hours}h ago`;
};

/** Full date and time, used as the tooltip/screen-reader detail for a relative label. */
export const formatAbsoluteTime = (date: Date): string =>
	`${absoluteDateFormatter.format(date)}, ${absoluteTimeFormatter.format(date)}`;

/**
 * How often a relative label needs re-rendering to stay accurate: every 30s
 * while it counts minutes, then every 5 minutes, and never once it has settled
 * on an absolute date.
 */
export const getRefreshIntervalMs = (
	date: Date,
	now: Date = new Date(),
	style: RelativeTimeStyle = 'short',
): number | undefined => {
	const elapsedMs = now.getTime() - date.getTime();

	if (!isRelativeTime(date, now)) {
		return undefined;
	}
	if (style === 'long' && elapsedMs < MINUTE_MS) {
		return SECOND_MS;
	}
	const regularIntervalMs =
		elapsedMs < HOUR_MS ? 30 * SECOND_MS : 5 * MINUTE_MS;
	return Math.min(regularIntervalMs, DAY_MS - elapsedMs);
};
