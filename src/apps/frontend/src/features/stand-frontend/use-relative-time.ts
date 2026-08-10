import { useEffect, useMemo, useReducer } from 'react';
import {
	formatAbsoluteTime,
	formatRelativeTime,
	getRefreshIntervalMs,
	parsePublicationDate,
} from './relative-time';

interface RelativeTime {
	/** Short relative label, e.g. `2m ago`. */
	label: string;
	/** Full date and time, for the tooltip and screen readers. */
	formattedAbsoluteTime: string;
	/** The original ISO 8601 timestamp, for a `<time dateTime>` attribute. */
	iso8601: string;
}

/**
 * Turns a CAPI `iso8601` timestamp into a relative label (e.g. `2m ago`) that
 * ticks on its own, so a card left open on screen doesn't keep claiming an
 * article was published "just now". Returns `undefined` for missing or
 * unparseable timestamps.
 */
export const useRelativeTime = (iso8601?: string): RelativeTime | undefined => {
	const date = useMemo(() => parsePublicationDate(iso8601), [iso8601]);
	const [, tick] = useReducer((count: number) => count + 1, 0);

	// Derived from the current time rather than held in state, so it stays
	// correct when `iso8601` changes without an effect having to re-sync it.
	const label = date ? formatRelativeTime(date) : undefined;
	const intervalMs = date ? getRefreshIntervalMs(date) : undefined;

	useEffect(() => {
		if (intervalMs === undefined) {
			return;
		}

		const timer = setInterval(tick, intervalMs);

		return () => clearInterval(timer);
	}, [intervalMs]);

	if (!date || !label || !iso8601) {
		return undefined;
	}

	return { label, formattedAbsoluteTime: formatAbsoluteTime(date), iso8601 };
};
