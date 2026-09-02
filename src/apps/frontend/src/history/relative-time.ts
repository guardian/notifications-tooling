const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Beyond this age a relative label stops being useful, so show a date instead. */
const ABSOLUTE_THRESHOLD_MS = 7 * DAY_MS;

const absoluteDateFormatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'Europe/London',
});

const absoluteDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	dateStyle: 'medium',
	timeStyle: 'short',
	timeZone: 'Europe/London',
});

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
 * Formats a publication date as a short, relative label, e.g. `2m ago`.
 * Dates older than a week (or in the future) fall back to an
 * absolute date, e.g. `12 Jul 2026`.
 */
export const formatRelativeTime = (
	date: Date,
	now: Date = new Date(),
): string => {
	const elapsedMs = now.getTime() - date.getTime();

	if (elapsedMs < 0) {
		return absoluteDateFormatter.format(date);
	}
	if (elapsedMs < MINUTE_MS) {
		return 'just now';
	}
	if (elapsedMs < HOUR_MS) {
		return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
	}
	if (elapsedMs < DAY_MS) {
		return `${Math.floor(elapsedMs / HOUR_MS)}h ago`;
	}
	if (elapsedMs < ABSOLUTE_THRESHOLD_MS) {
		return `${Math.floor(elapsedMs / DAY_MS)}d ago`;
	}
	return absoluteDateFormatter.format(date);
};

/** Full date and time, used as the tooltip/screen-reader detail for a relative label. */
export const formatAbsoluteTime = (date: Date): string =>
	absoluteDateTimeFormatter.format(date);

/**
 * How often a relative label needs re-rendering to stay accurate: every 30s
 * while it counts minutes, then every 5 minutes, and never once it has settled
 * on an absolute date.
 */
export const getRefreshIntervalMs = (
	date: Date,
	now: Date = new Date(),
): number | undefined => {
	const elapsedMs = now.getTime() - date.getTime();

	if (elapsedMs < 0 || elapsedMs >= ABSOLUTE_THRESHOLD_MS) {
		return undefined;
	}
	return elapsedMs < HOUR_MS ? 30 * SECOND_MS : 5 * MINUTE_MS;
};
