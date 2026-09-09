export type LocalSendTimeRegion = 'UK' | 'US' | 'AU' | 'EU';

export interface LocalSendTime {
	region: LocalSendTimeRegion;
	time: string;
}

const localSendTimeZones: ReadonlyArray<{
	region: LocalSendTimeRegion;
	locale: string;
	timeZone: string;
}> = [
		{ region: 'UK', locale: 'en-GB', timeZone: 'Europe/London' },
		{ region: 'US', locale: 'en-US', timeZone: 'America/New_York' },
		{ region: 'AU', locale: 'en-AU', timeZone: 'Australia/Sydney' },
		{ region: 'EU', locale: 'en-GB', timeZone: 'Europe/Paris' },
	];

const localTimeFormatters = localSendTimeZones.map(
	({ region, locale, timeZone }) => ({
		region,
		formatter: new Intl.DateTimeFormat(locale, {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
			timeZoneName: 'short',
			timeZone,
		}),
	}),
);

/**
 * Converts a send time into the local time of each edition's region, so an
 * editor can see when an alert landed for its audience. Returns an empty array
 * for a missing or unparseable timestamp, so callers can hide the detail.
 */
export const formatLocalSendTimes = (iso8601: string): LocalSendTime[] => {
	const sentAt = new Date(iso8601);

	if (Number.isNaN(sentAt.getTime())) {
		return [];
	}

	return localTimeFormatters.map(({ region, formatter }) => ({
		region,
		time: formatter.format(sentAt),
	}));
};
