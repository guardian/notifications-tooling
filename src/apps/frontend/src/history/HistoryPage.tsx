import { InlineMessage } from '@guardian/stand/InlineMessage';
import { useSearchParams } from 'react-router-dom';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { parseHistorySearchParams } from '../utils/history-search-params';
import { mapNotificationToHistoryNotification } from '../utils/notification-history-mapper';
import { HistoryView } from './HistoryView';

export const HistoryPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const historyQuery = parseHistorySearchParams(searchParams);
	const notificationHistory = useNotificationHistory(historyQuery);
	const channelAudiences = useChannelAudiences();

	const limit = historyQuery.limit;
	const offset = historyQuery.offset;
	const currentPage = Math.max(1, Math.floor(offset / limit) + 1);

	const handlePageChange = (page: number) => {
		setSearchParams((currentSearchParams) => {
			const nextSearchParams = new URLSearchParams(currentSearchParams);
			nextSearchParams.set('offset', String((page - 1) * limit));
			nextSearchParams.set('limit', String(limit));

			return nextSearchParams;
		});
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
			handlePageChange={handlePageChange}
			currentPage={currentPage}
		/>
	);
};
