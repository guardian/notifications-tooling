const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const absoluteDateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	hour: '2-digit',
	minute: '2-digit',
	timeZoneName: 'short',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'Europe/London',
});

export interface HistorySendTime {
	label: string;
	isRecent: boolean;
}

export const formatHistorySendTime = (
	iso8601: string,
	now: Date = new Date(),
): HistorySendTime => {
	const sentAt = new Date(iso8601);
	const elapsedMs = now.getTime() - sentAt.getTime();

	if (Number.isNaN(sentAt.getTime()) || elapsedMs < 0 || elapsedMs >= DAY_MS) {
		return {
			label: Number.isNaN(sentAt.getTime())
				? iso8601
				: absoluteDateTimeFormatter.format(sentAt),
			isRecent: false,
		};
	}

	if (elapsedMs < MINUTE_MS) {
		return {
			label: `${Math.floor(elapsedMs / SECOND_MS)} secs ago`,
			isRecent: true,
		};
	}

	if (elapsedMs < HOUR_MS) {
		return {
			label: `${Math.floor(elapsedMs / MINUTE_MS)} mins ago`,
			isRecent: true,
		};
	}

	return {
		label: `${Math.floor(elapsedMs / HOUR_MS)} hours ago`,
		isRecent: true,
	};
};
