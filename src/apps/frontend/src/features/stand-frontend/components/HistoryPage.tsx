import { InlineMessage } from '@guardian/stand/InlineMessage';
import { useSearchParams } from 'react-router-dom';
import { useChannelAudiences } from '../api/useChannelAudiences';
import { useNotificationHistory } from '../api/useNotificationHistory';
import { parseHistorySearchParams } from '../history-search-params';
import { mapNotificationToHistoryAlert } from '../notification-history-mapper';
import { HistoryTab } from './HistoryTab';

export const HistoryPage = () => {
	const [searchParams] = useSearchParams();
	const historyQuery = parseHistorySearchParams(searchParams);
	const notificationHistory = useNotificationHistory(historyQuery);
	const channelAudiences = useChannelAudiences();

	const alerts =
		notificationHistory.data?.notifications.flatMap((notification) => {
			const alert = mapNotificationToHistoryAlert(
				notification,
				channelAudiences.data,
			);
			return alert ? [alert] : [];
		}) ?? [];

	return (
		<HistoryTab
			alerts={alerts}
			isLoading={notificationHistory.isPending}
			error={
				notificationHistory.isError ? (
					<InlineMessage level="error">
						Unable to load notification history. Try again.
					</InlineMessage>
				) : undefined
			}
		/>
	);
};
