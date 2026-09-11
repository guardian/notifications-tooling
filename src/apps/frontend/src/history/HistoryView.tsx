import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { DisplayAppAlertTopicEditionId } from '@models';
import type { ReactNode } from 'react';
import { historyViewStyles, layoutMainTheme } from '../themes';
import { LastUpdated } from '../ui/LastUpdated';
import { RefreshButton } from '../ui/RefreshButton';
import { HistoryEmptyState } from './HistoryEmptyState';
import { HistoryPagination } from './HistoryPagination';
import { HistoryTable, HistoryTableSkeleton } from './HistoryTable';

export type HistoryStatus = 'Accepted' | 'Sent' | 'Failed';

export interface HistoryNotification {
	id: string;
	title: string;
	href: string;
	thumbnailUrl?: string;
	channel: 'email' | 'push';
	alertType: string;
	sentBy: string;
	sentTo: DisplayAppAlertTopicEditionId[];
	sentAt: string;
	status: HistoryStatus;
}

interface HistoryViewProps {
	notifications?: HistoryNotification[];
	totalItems?: number;
	limit: number;
	currentPage: number;
	isLoading?: boolean;
	isRefreshing?: boolean;
	error?: ReactNode;
	lastUpdatedAt?: string;
	handlePageChange: (page: number) => void;
	handleRefresh: () => void;
	onSelectFailure?: (notification: HistoryNotification) => void;
}

export const HistoryView = ({
	notifications = [],
	totalItems = 0,
	isLoading = false,
	isRefreshing = false,
	limit,
	error,
	lastUpdatedAt,
	currentPage,
	handlePageChange,
	handleRefresh,
	onSelectFailure,
}: HistoryViewProps) => {
	return (
		<Layout.Main theme={layoutMainTheme}>
			<section
				aria-labelledby="history-heading"
				css={historyViewStyles.container}
			>
				<div css={historyViewStyles.header}>
					<div css={historyViewStyles.titleBlock}>
						<Typography id="history-heading" element="h1" variant="headingLg">
							History
						</Typography>
					</div>
					{!isLoading && !error && (
						<div css={historyViewStyles.headerActions}>
							<div css={historyViewStyles.refreshControls}>
								{lastUpdatedAt && <LastUpdated updatedAt={lastUpdatedAt} />}
								<RefreshButton
									onRefresh={handleRefresh}
									isRefreshing={isRefreshing}
								/>
							</div>
							{totalItems > limit && (
								<HistoryPagination
									currentPage={currentPage}
									totalItems={totalItems}
									onPageChange={handlePageChange}
									limit={limit}
								/>
							)}
						</div>
					)}
				</div>
				{isLoading && <HistoryTableSkeleton />}
				{error}
				{!isLoading && !error && notifications.length > 0 && (
					<HistoryTable
						notifications={notifications}
						onSelectFailure={onSelectFailure}
					/>
				)}
				{!isLoading && !error && notifications.length === 0 && (
					<HistoryEmptyState />
				)}
			</section>
		</Layout.Main>
	);
};
