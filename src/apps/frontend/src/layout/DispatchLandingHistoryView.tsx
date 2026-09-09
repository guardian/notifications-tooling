import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { HistoryTable } from '../history/HistoryTable';
import type { HistoryNotification } from '../history/HistoryView';
import { dispatchLandingTheme, historyViewStyles } from '../themes';

interface DispatchLandingHistoryViewProps {
	notifications?: HistoryNotification[];
	isLoading?: boolean;
	error?: ReactNode;
}

export const DispatchLandingHistoryView = ({
	notifications = [],
	isLoading = false,
	error,
}: DispatchLandingHistoryViewProps) => {
	return (
		<>
			<div css={historyViewStyles.header}>
				<Typography
					variant="headingXl"
					cssOverrides={dispatchLandingTheme.dispatchHistoryHeader}
				>
					Last 24-hour activity
				</Typography>
			</div>
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
