import { css } from '@emotion/react';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { useSearchParams } from 'react-router-dom';
import { HistoryView } from '../history/HistoryView';
import { mapNotificationToHistoryNotification } from '../history/notification-history-mapper';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { parseHistorySearchParams } from '../utils/history-search-params';

export const DispatchLandingTab = () => {
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
		<Layout.Main>
			<div>
				<Typography variant="heading2Xl" element="h1">
					Dispatch Landing Page
				</Typography>
				<section css={css({ width: '983px', marginTop: '16px' })}>
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
						dispatchLandingPage={true}
					/>
				</section>
			</div>
		</Layout.Main>
	);
};
