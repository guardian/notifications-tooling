import { InlineMessage } from '@guardian/stand/InlineMessage';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { parseHistorySearchParams } from '../utils/history-search-params';
import { mapNotificationToHistoryNotification } from '../utils/notification-history-mapper';
import { HistoryView } from './HistoryView';

export const HistoryPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const parsedHistoryQuery = parseHistorySearchParams(searchParams);
	const searchTerm = parsedHistoryQuery.search ?? '';
	const selectedAudiences = parsedHistoryQuery.audiences ?? [];
	const debouncedSearch = useDebouncedValue(parsedHistoryQuery.search, 300);
	const isSearchPending = parsedHistoryQuery.search !== debouncedSearch;
	const historyQuery = { ...parsedHistoryQuery, search: debouncedSearch };
	const notificationHistory = useNotificationHistory(historyQuery, {
		enabled: !isSearchPending,
	});
	const channelAudiences = useChannelAudiences();

	const { limit, offset } = historyQuery;
	const currentPage = Math.max(1, Math.floor(offset / limit) + 1);

	const handlePageChange = (page: number) => {
		setSearchParams((currentSearchParams) => {
			const nextSearchParams = new URLSearchParams(currentSearchParams);
			nextSearchParams.set('offset', String((page - 1) * limit));
			nextSearchParams.set('limit', String(limit));

			return nextSearchParams;
		});
	};
	const handleSearchTermChange = (nextSearchTerm: string) => {
		setSearchParams(
			(currentSearchParams) => {
				const nextSearchParams = new URLSearchParams(currentSearchParams);
				if (nextSearchTerm.trim()) {
					nextSearchParams.set('search', nextSearchTerm);
				} else {
					nextSearchParams.delete('search');
				}
				nextSearchParams.set('offset', '0');
				nextSearchParams.set('limit', String(limit));

				return nextSearchParams;
			},
			{ replace: true },
		);
	};
	const handleAudienceChange = (audiences: typeof selectedAudiences) => {
		setSearchParams(
			(currentSearchParams) => {
				const nextSearchParams = new URLSearchParams(currentSearchParams);
				nextSearchParams.delete('audience');
				for (const audience of audiences) {
					nextSearchParams.append('audience', audience);
				}
				nextSearchParams.set('offset', '0');
				nextSearchParams.set('limit', String(limit));

				return nextSearchParams;
			},
			{ replace: true },
		);
	};
	const handleClearFilters = () => {
		setSearchParams(new URLSearchParams(), { replace: true });
	};
	const handleRefresh = () => void notificationHistory.refetch();

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
			isLoading={notificationHistory.isPending}
			error={
				notificationHistory.isError ? (
					<InlineMessage level="error">
						Unable to load notification history. Try again.
					</InlineMessage>
				) : undefined
			}
			limit={limit}
			onPageChange={handlePageChange}
			onRefresh={handleRefresh}
			isRefreshing={notificationHistory.isFetching}
			lastUpdatedAt={
				notificationHistory.dataUpdatedAt
					? new Date(notificationHistory.dataUpdatedAt).toISOString()
					: undefined
			}
			currentPage={currentPage}
			searchTerm={searchTerm}
			selectedAudiences={selectedAudiences}
			onSearchTermChange={handleSearchTermChange}
			onAudienceChange={handleAudienceChange}
			onClearFilters={handleClearFilters}
		/>
	);
};
