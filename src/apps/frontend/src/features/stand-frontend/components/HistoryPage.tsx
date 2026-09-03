import { InlineMessage } from '@guardian/stand/InlineMessage';
import { useSearchParams } from 'react-router-dom';
import { useChannelAudiences } from '../api/useChannelAudiences';
import { useNotificationHistory } from '../api/useNotificationHistory';
import { parseHistorySearchParams } from '../history-search-params';
import { mapNotificationToHistoryAlert } from '../notification-history-mapper';
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

	const alerts =
		notificationHistory.data?.notifications.flatMap((notification) => {
			const alert = mapNotificationToHistoryAlert(
				notification,
				channelAudiences.data,
			);
			return alert ? [alert] : [];
		}) ?? [];

	return (
		<HistoryView
			alerts={alerts}
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
