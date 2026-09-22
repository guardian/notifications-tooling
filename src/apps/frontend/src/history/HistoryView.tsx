import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { DisplayAppAlertTopicEditionId } from '@models';
import type { ReactNode } from 'react';
import type { ChannelAudienceResponse } from '../schemas';
import { historyViewStyles, layoutMainTheme } from '../themes';
import type { ChannelOption } from '../types';
import { LastUpdated } from '../ui/LastUpdated';
import { RefreshButton } from '../ui/RefreshButton';
import { HistoryEmptyState } from './HistoryEmptyState';
import { HistoryFilters } from './HistoryFilters';
import { HistoryPagination } from './HistoryPagination';
import { HistoryTable, HistoryTableSkeleton } from './HistoryTable';

export type HistoryStatus = 'Accepted' | 'Sent' | 'Partially sent' | 'Failed';

export interface HistoryNotification {
	id: string;
	title: string;
	href: string;
	thumbnailUrl?: string;
	channel: ChannelOption;
	alertType: string;
	sentBy: string;
	sentTo: DisplayAppAlertTopicEditionId[];
	sentAt: string;
	status: HistoryStatus;
}

interface HistoryViewProps {
	notifications?: HistoryNotification[];
	audiences?: ChannelAudienceResponse;
	totalItems?: number;
	limit: number;
	currentPage: number;
	isLoading?: boolean;
	isRefreshing?: boolean;
	error?: ReactNode;
	lastUpdatedAt?: string;
	hasActiveFilters?: boolean;
	onPageChange: (page: number) => void;
	onRefresh: () => void;
}

export const HistoryView = ({
	notifications = [],
	audiences,
	totalItems = 0,
	isLoading = false,
	isRefreshing = false,
	limit,
	error,
	lastUpdatedAt,
	hasActiveFilters = false,
	currentPage,
	onPageChange,
	onRefresh,
}: HistoryViewProps) => {
	return (
		<Layout.Main theme={layoutMainTheme}>
			<div css={historyViewStyles.page}>
				<HistoryFilters />
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
										onRefresh={onRefresh}
										isRefreshing={isRefreshing}
									/>
								</div>
								{totalItems > limit && (
									<HistoryPagination
										currentPage={currentPage}
										totalItems={totalItems}
										onPageChange={onPageChange}
										limit={limit}
									/>
								)}
							</div>
						)}
					</div>
					{isLoading && <HistoryTableSkeleton />}
					{error}
					{!isLoading && !error && notifications.length > 0 && (
						<HistoryTable notifications={notifications} audiences={audiences} />
					)}
					{!isLoading && !error && notifications.length === 0 && (
						<HistoryEmptyState isSearchResult={hasActiveFilters} />
					)}
				</section>
			</div>
		</Layout.Main>
	);
};
