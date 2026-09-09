import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { DisplayAppAlertTopicEditionId } from '@models';
import type { ReactNode } from 'react';
import { historyViewStyles, layoutMainTheme } from '../themes';
import { LastUpdated } from '../ui/LastUpdated';
import { RefreshButton } from '../ui/RefreshButton';
import { HistoryPagination } from './HistoryPagination';
import { HistoryTable } from './HistoryTable';

export type HistoryStatus = 'Accepted' | 'Sent' | 'Partially sent' | 'Failed';

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
				{isLoading && (
					<Typography variant="bodyMd">Loading history...</Typography>
				)}
				{error}
				{!isLoading && !error && <HistoryTable notifications={notifications} />}
				{!isLoading && !error && notifications.length === 0 && (
					<Typography variant="bodyMd" cssOverrides={historyViewStyles.empty}>
						No alerts have been sent yet.
					</Typography>
				)}
			</section>
		</Layout.Main>
	);
};
