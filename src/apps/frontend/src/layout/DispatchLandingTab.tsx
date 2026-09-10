import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { notificationRoutes } from '../routes';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { dispatchLandingTheme } from '../themes';
import { parseHistorySearchParams } from '../utils/history-search-params';
import { mapNotificationToHistoryNotification } from '../utils/notification-history-mapper';
import { ClickableTile } from './ClickableTile';
import { DispatchLandingHistoryView } from './DispatchLandingHistoryView';

const dispatchClickableTiles = [
	{
		title: 'Create a newsletter email',
		icon: 'mail',
		href: notificationRoutes.email.create,
	},
	{
		title: 'Create an app alert',
		icon: 'appAlert',
		href: notificationRoutes.push.create,
	},
	{
		title: 'History',
		icon: 'history',
		href: '/history',
	},
] as const;

export const DispatchLandingTab = () => {
	const [searchParams] = useSearchParams();
	const parsedHistoryQuery = parseHistorySearchParams(searchParams);
	const [last24HoursSince] = useState(() =>
		Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
	);
	const historyQuery = {
		...parsedHistoryQuery,
		since: last24HoursSince,
		cacheScope: 'last-24-hours',
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
			<div
				css={{
					width: '100%',
					maxWidth: '983px',
				}}
			>
				<Typography variant="titleXl" element={'h1'}>
					Welcome to Dispatch
				</Typography>
				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						gap: '12px',
						width: '100%',
						marginTop: '16px',
						marginBottom: '16px',
						paddingTop: '12px',
						[from.md]: {
							flexDirection: 'row',
							justifyContent: 'space-between',
						},
					}}
				>
					{dispatchClickableTiles.map((tile) => (
						<ClickableTile
							key={tile.title}
							title={tile.title}
							icon={tile.icon}
							href={tile.href}
						/>
					))}
				</div>
				<div css={dispatchLandingTheme.dispatchTableSection}>
					<DispatchLandingHistoryView
						notifications={notifications}
						isLoading={notificationHistory.isPending}
						isRefreshing={notificationHistory.isFetching}
						lastUpdatedAt={
							notificationHistory.dataUpdatedAt
								? new Date(notificationHistory.dataUpdatedAt).toISOString()
								: undefined
						}
						handleRefresh={() => void notificationHistory.refetch()}
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
