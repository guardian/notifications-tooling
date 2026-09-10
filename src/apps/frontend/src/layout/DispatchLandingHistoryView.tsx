import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { HistoryTable } from '../history/HistoryTable';
import type { HistoryNotification } from '../history/HistoryView';
import {
	activePillTheme,
	dispatchLandingTheme,
	historyViewStyles,
} from '../themes';
import { phoneIphoneIcon } from '../ui/FlagIcons';
import { LastUpdated } from '../ui/LastUpdated';
import { RefreshButton } from '../ui/RefreshButton';

interface DispatchLandingHistoryViewProps {
	notifications?: HistoryNotification[];
	isLoading?: boolean;
	isRefreshing?: boolean;
	lastUpdatedAt?: string;
	handleRefresh: () => void;
	error?: ReactNode;
}

export const DispatchLandingHistoryView = ({
	notifications = [],
	isLoading = false,
	isRefreshing = false,
	lastUpdatedAt,
	handleRefresh,
	error,
}: DispatchLandingHistoryViewProps) => {
	const newsletterCount = notifications.filter(
		(n) => n.channel === 'email',
	).length;
	const appAlertCount = notifications.filter(
		(n) => n.channel === 'push',
	).length;

	const selectedPills = [
		{
			label: 'Newsletter email',
			icon: 'mail',
			count: newsletterCount,
		},
		{
			label: 'App alert',
			icon: phoneIphoneIcon,
			count: appAlertCount,
		},
	] as const;

	return (
		<>
			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: '10px',
					marginBottom: '16px',
				}}
			>
				<Typography variant="headingXl">Last 24-hour activity</Typography>
				<div
					css={{
						display: 'flex',
						flexDirection: 'row',
						height: '32px',
						gap: '8px',
					}}
				>
					{selectedPills.map((pill) => (
						<div key={pill.label} css={activePillTheme.isConfirmationStyle}>
							{pill.icon === 'mail' ? (
								<Icon symbol={'mail'} size="md" />
							) : (
								<Icon size="md" cssOverrides={activePillTheme.activePillIcon}>
									{phoneIphoneIcon}
								</Icon>
							)}
							<Typography variant={'bodySm'}>
								{pill.label} {''}
							</Typography>
							<Typography variant={'bodyBoldSm'}>{pill.count}</Typography>
						</div>
					))}
				</div>
			</div>
			{!isLoading && !error && (
				<div css={dispatchLandingTheme.activityControls}>
					<div css={historyViewStyles.refreshControls}>
						{lastUpdatedAt && <LastUpdated updatedAt={lastUpdatedAt} />}
						<RefreshButton
							onRefresh={handleRefresh}
							isRefreshing={isRefreshing}
						/>
					</div>
				</div>
			)}
			{isLoading && (
				<Typography variant="bodyMd">Loading 24 hour history...</Typography>
			)}
			{error}
			{!isLoading && !error && <HistoryTable notifications={notifications} />}
			{!isLoading && !error && notifications.length === 0 && (
				<Typography variant="bodyMd" cssOverrides={historyViewStyles.empty}>
					No alerts have been sent yet.
				</Typography>
			)}
		</>
	);
};
