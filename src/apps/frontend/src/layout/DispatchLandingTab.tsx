import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mapNotificationToHistoryNotification } from '../history/notification-history-mapper';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { dispatchLandingTheme } from '../themes';
import { parseHistorySearchParams } from '../utils/history-search-params';
import { DispatchLandingHistoryView } from './DispatchLandingHistoryView';

export const DispatchLandingTab = () => {
	const [searchParams] = useSearchParams();
	const parsedHistoryQuery = parseHistorySearchParams(searchParams);
	const [last24HoursSince] = useState(() =>
		Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
	);
	const historyQuery = {
		...parsedHistoryQuery,
		since: last24HoursSince,
	};
	const notificationHistory = useNotificationHistory(historyQuery);
	const channelAudiences = useChannelAudiences();
	const notifications =
		notificationHistory.data?.notifications.flatMap((notification) => {
			const historyNotification = mapNotificationToHistoryNotification(
				notification,
				channelAudiences.data,
			);
			return historyNotification ? [historyNotification] : [];
		}) ?? [];

	return (
		<Layout.Main css={dispatchLandingTheme.dispatchMainContainer}>
			<div>
				<Typography variant="titleXl" element={'h1'}>
					Welcome to Dispatch
				</Typography>
				<div css={dispatchLandingTheme.dispatchTableSection}>
					<DispatchLandingHistoryView
						notifications={notifications}
						isLoading={notificationHistory.isPending}
						error={
							notificationHistory.isError ? (
								<InlineMessage level="error">
									Unable to load notification history. Try again.
								</InlineMessage>
							) : undefined
						}
					/>
				</div>
			</div>
		</Layout.Main>
	);
};
