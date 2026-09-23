import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import {
	parseHistorySearchParams,
	updateHistoryFilters,
} from '../utils/history-search-params';
import { mapNotificationToHistoryNotification } from '../utils/notification-history-mapper';
import { hasInvalidAlertTypes } from './HistoryAlertTypeFilter';
import { HistoryView } from './HistoryView';

export const HistoryPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const parsedHistoryQuery = parseHistorySearchParams(searchParams);
	const debouncedSearch = useDebouncedValue(parsedHistoryQuery.search, 300);
	const isSearchPending = parsedHistoryQuery.search !== debouncedSearch;
	const historyQuery = parsedHistoryQuery;
	const alertTypes = historyQuery.alertTypes ?? [];
	const hasInvalidFilters = hasInvalidAlertTypes(alertTypes);
	const notificationHistory = useNotificationHistory(historyQuery, {
		enabled: !isSearchPending && !hasInvalidFilters,
	});
	const channelAudiences = useChannelAudiences();

	const { limit, offset } = historyQuery;
	const currentPage = Math.max(1, Math.floor(offset / limit) + 1);

	const handlePageChange = (page: number) => {
		setSearchParams((currentSearchParams) => {
			const nextSearchParams = updateHistoryFilters(currentSearchParams, {});
			nextSearchParams.set('offset', String((page - 1) * limit));
			nextSearchParams.set('limit', String(limit));

			return nextSearchParams;
		});
	};
	const handleClearAlertTypes = () => {
		setSearchParams((currentSearchParams) =>
			updateHistoryFilters(currentSearchParams, { alertTypes: [] }),
		);
	};
	const handleRefresh = () => {
		if (!isSearchPending && !hasInvalidFilters) {
			void notificationHistory.refetch();
		}
	};

	const notifications =
		notificationHistory.data?.notifications.flatMap((notification) => {
			const historyNotification = mapNotificationToHistoryNotification(
				notification,
				channelAudiences.data,
			);
			return historyNotification ? [historyNotification] : [];
		}) ?? [];

	return (
		<HistoryView
			notifications={notifications}
			audiences={channelAudiences.data}
			totalItems={notificationHistory.data?.total ?? 0}
			isLoading={
				!hasInvalidFilters &&
				(notificationHistory.isPending ||
					isSearchPending ||
					notificationHistory.isPlaceholderData)
			}
			error={
				hasInvalidFilters ? (
					<InlineMessage level="error">
						Invalid Kicker / Alert type filter.
						<Button
							variant="tertiary"
							size="sm"
							onClick={handleClearAlertTypes}
						>
							Clear Kicker / Alert type filter
						</Button>
					</InlineMessage>
				) : notificationHistory.isError &&
				notificationHistory.data === undefined ? (
					<InlineMessage level="error">
						Unable to load notification history. Try again.
					</InlineMessage>
				) : undefined
			}
			refreshError={
				notificationHistory.isRefetchError ? (
					<InlineMessage level="error">
						Unable to refresh notification history. Showing cached results.
					</InlineMessage>
				) : undefined
			}
			limit={limit}
			onPageChange={handlePageChange}
			onRefresh={handleRefresh}
			isRefreshing={notificationHistory.isFetching || isSearchPending}
			lastUpdatedAt={
				notificationHistory.dataUpdatedAt
					? new Date(notificationHistory.dataUpdatedAt).toISOString()
					: undefined
			}
			currentPage={currentPage}
			hasActiveFilters={
				parsedHistoryQuery.search !== undefined ||
				(parsedHistoryQuery.audiences?.length ?? 0) > 0 ||
				(parsedHistoryQuery.statuses?.length ?? 0) > 0 ||
				alertTypes.length > 0
			}
		/>
	);
};
