import {
	canonicalHistoryAlertTypes,
	notificationAudienceFilterId,
	notificationAudienceFilterIds,
} from '@models';

export const DEFAULT_LIMIT = 20;
export const MAXIMUM_LIMIT = 50;
export const DEFAULT_OFFSET = 0;
export const MAXIMUM_SEARCH_LENGTH = 200;
export const MAXIMUM_SENDER_LENGTH = 320;
export const HISTORY_AUDIENCE_IDS = notificationAudienceFilterIds;
export const HISTORY_CHANNELS = ['newsletter', 'app-push'] as const;
export type HistoryChannel = (typeof HISTORY_CHANNELS)[number];
export const HISTORY_STATUS_CATEGORIES = ['sent', 'error'] as const;
export type HistoryStatusCategory = (typeof HISTORY_STATUS_CATEGORIES)[number];

export type HistoryMultiSelectFilter = 'audience' | 'channel' | 'status';

const parseBoundedInteger = (
	value: string | null,
	fallback: number,
	minimum: number,
	maximum?: number,
) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) &&
		parsed >= minimum &&
		(maximum === undefined || parsed <= maximum)
		? parsed
		: fallback;
};

export const parseHistorySearchParams = (searchParams: URLSearchParams) => {
	const search = searchParams.get('search')?.trim();
	const audiences = [
		...new Set(
			searchParams.getAll('audience').flatMap((audience) => {
				const parsed = notificationAudienceFilterId.safeParse(audience);
				return parsed.success ? [parsed.data] : [];
			}),
		),
	];
	const requestedChannels = new Set(searchParams.getAll('channel'));
	const channels = HISTORY_CHANNELS.filter((channel) =>
		requestedChannels.has(channel),
	);
	const requestedStatuses = new Set(searchParams.getAll('status'));
	const statuses = HISTORY_STATUS_CATEGORIES.filter((status) =>
		requestedStatuses.has(status),
	);
	const alertTypes = canonicalHistoryAlertTypes(
		searchParams.getAll('alertType'),
	);
	const senders = [
		...new Set(
			searchParams
				.getAll('createdByEmail')
				.map((sender) => sender.trim().toLowerCase())
				.filter(
					(sender) =>
						sender.length > 0 && sender.length <= MAXIMUM_SENDER_LENGTH,
				),
		),
	];

	return {
		limit: parseBoundedInteger(
			searchParams.get('limit'),
			DEFAULT_LIMIT,
			1,
			MAXIMUM_LIMIT,
		),
		offset: parseBoundedInteger(searchParams.get('offset'), DEFAULT_OFFSET, 0),
		since: (() => {
			const value = searchParams.get('since');
			if (value === null) {
				return undefined;
			}
			const parsed = Number(value);
			return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
		})(),
		...(search && search.length <= MAXIMUM_SEARCH_LENGTH ? { search } : {}),
		...(senders.length > 0 ? { senders } : {}),
		...(channels.length > 0 ? { channels } : {}),
		...(audiences.length > 0 ? { audiences } : {}),
		...(statuses.length > 0 ? { statuses } : {}),
		...(alertTypes.length > 0 ? { alertTypes } : {}),
	};
};

export const updateHistoryMultiSelectFilter = (
	searchParams: URLSearchParams,
	filter: HistoryMultiSelectFilter,
	values: readonly string[],
) => {
	const next = new URLSearchParams(searchParams);
	next.delete(filter);
	for (const value of values) {
		next.append(filter, value);
	}
	next.set('offset', '0');
	next.set('limit', String(parseHistorySearchParams(searchParams).limit));
	return next;
};

export const updateHistoryFilters = (
	searchParams: URLSearchParams,
	updates: { search?: string; alertTypes?: string[] },
) => {
	const next = new URLSearchParams(searchParams);
	if (updates.search !== undefined) {
		if (updates.search.trim()) {
			next.set('search', updates.search);
		} else {
			next.delete('search');
		}
	}
	const alertTypes = updates.alertTypes ?? next.getAll('alertType');
	next.delete('alertType');
	for (const alertType of canonicalHistoryAlertTypes(alertTypes)) {
		next.append('alertType', alertType);
	}
	next.set('offset', '0');
	next.set('limit', String(parseHistorySearchParams(searchParams).limit));
	return next;
};
