import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Layout } from '@guardian/stand/Layout';
import { Tile } from '@guardian/stand/Tile';
import { Typography } from '@guardian/stand/Typography';
import { between, from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConfigContext } from '../config/ConfigContext';
import { useNotificationHistory } from '../hooks/useNotificationHistory';
import { LatestPublishedContentPanel } from '../latest-content/LatestPublishedContentPanel';
import { DispatchLandingHistoryView } from '../layout/DispatchLandingHistoryView';
import { notificationRoutes } from '../routes';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { dispatchLandingTheme } from '../themes';
import { phoneIphoneIcon } from '../ui/flag-icons';
import { parseHistorySearchParams } from '../utils/history-search-params';
import { mapNotificationToHistoryNotification } from '../utils/notification-history-mapper';

const landingTileStyles = css({
	width: '100%',
	[between.md.and.lg]: {
		flex: '1 1 0',
		width: 'auto',
	},
	[from.lg]: {
		width: '325px',
	},
});

export const DispatchLandingPage = () => {
	const config = useContext(ConfigContext);
	const [searchParams] = useSearchParams();
	const parsedHistoryQuery = parseHistorySearchParams(searchParams);
	const historyQuery = {
		...parsedHistoryQuery,
		cacheScope: 'last-24-hours',
	};
	const notificationHistory = useNotificationHistory(historyQuery, {
		getSince: () =>
			Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
	});
	const channelAudiences = useChannelAudiences();
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
		<>
			<Layout.Main css={dispatchLandingTheme.primaryColumn}>
				<Typography variant="titleXl" element={'h1'}>
					Welcome to Dispatch
				</Typography>
				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						gap: '12px',
						width: '100%',
						marginTop: semanticSpacing.stackMd,
						marginBottom: semanticSpacing.stackLg,
						paddingTop: semanticSpacing.stackMd,
						[from.md]: {
							display: 'grid',
							gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
						},
					}}
				>
					<Tile
						size="sm"
						href={notificationRoutes.newsletter.create}
						icon="mail"
						typography="headingMd"
						cssOverrides={landingTileStyles}
					>
						Create a newsletter email
					</Tile>
					<Tile
						size="sm"
						href={notificationRoutes['app-push'].create}
						icon={phoneIphoneIcon}
						typography="headingMd"
						cssOverrides={landingTileStyles}
					>
						Create an app alert
					</Tile>
					<Tile
						size="sm"
						href="/history"
						icon="history"
						typography="headingMd"
						cssOverrides={landingTileStyles}
					>
						History
					</Tile>
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
						onRefresh={handleRefresh}
						error={
							notificationHistory.isError ? (
								<InlineMessage level="error">
									Unable to load notification history. Try again.
								</InlineMessage>
							) : undefined
						}
					/>
				</div>
			</Layout.Main>
			{!config?.DISABLE_LATEST_PUBLISHED_CONTENT && (
				<aside css={dispatchLandingTheme.latestContentRail}>
					<LatestPublishedContentPanel />
				</aside>
			)}
		</>
	);
};
