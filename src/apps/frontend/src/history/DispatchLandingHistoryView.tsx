import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { notificationChannelNames } from '@models';
import type { ReactNode } from 'react';
import {
	activePillTheme,
	dispatchLandingTheme,
	historyViewStyles,
} from '../themes';
import { phoneIphoneIcon } from '../ui/flag-icons';
import { LastUpdated } from '../ui/LastUpdated';
import { RefreshButton } from '../ui/RefreshButton';
import { HistoryEmptyState } from './HistoryEmptyState';
import { HistoryTable, HistoryTableSkeleton } from './HistoryTable';
import type { HistoryNotification } from './HistoryView';

interface DispatchLandingHistoryViewProps {
	notifications?: HistoryNotification[];
	isLoading?: boolean;
	isRefreshing?: boolean;
	lastUpdatedAt?: string;
	onRefresh: () => void;
	error?: ReactNode;
}

export const DispatchLandingHistoryView = ({
	notifications = [],
	isLoading = false,
	isRefreshing = false,
	lastUpdatedAt,
	onRefresh,
	error,
}: DispatchLandingHistoryViewProps) => {
	const newsletterEmailCount = notifications.filter(
		(n) => n.channel === 'newsletter',
	).length;
	const appAlertCount = notifications.filter(
		(n) => n.channel === 'app-push',
	).length;

	const selectedPills = [
		{
			label: notificationChannelNames.newsletter,
			icon: 'mail',
			count: newsletterEmailCount,
		},
		{
			label: notificationChannelNames['app-push'],
			icon: phoneIphoneIcon,
			count: appAlertCount,
		},
	] as const;

	return (
		<>
			<div css={dispatchLandingTheme.activityHeading}>
				<Typography variant="headingXl">Last 24-hour activity</Typography>
			</div>
			<div
				role="group"
				aria-label="Activity summary"
				css={dispatchLandingTheme.activityControls}
			>
				<div css={dispatchLandingTheme.activityCounters}>
					{selectedPills.map((pill) => (
						<div key={pill.label} css={activePillTheme.outlinedPill}>
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
				{!isLoading && !error && (
					<div css={historyViewStyles.refreshControls}>
						{lastUpdatedAt && <LastUpdated updatedAt={lastUpdatedAt} />}
						<RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
					</div>
				)}
			</div>
			{isLoading && <HistoryTableSkeleton />}
			{error}
			{!isLoading && !error && notifications.length > 0 && (
				<HistoryTable notifications={notifications} showUserName />
			)}
			{!isLoading && !error && notifications.length === 0 && (
				<HistoryEmptyState />
			)}
		</>
	);
};
