import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { DisplayAppAlertTopicEditionId } from '@models';
import type { ReactNode } from 'react';
import { historyViewStyles, layoutMainTheme } from '../themes';
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
	error?: ReactNode;
	handlePageChange: (page: number) => void;
	dispatchLandingPage?: boolean;
}

export const HistoryView = ({
	notifications = [],
	totalItems = 0,
	isLoading = false,
	limit,
	error,
	currentPage,
	handlePageChange,
	dispatchLandingPage,
}: HistoryViewProps) => {
	return (
		<Layout.Main theme={layoutMainTheme}>
			<section
				aria-labelledby="history-heading"
				css={historyViewStyles.container}
			>
				<div css={historyViewStyles.header}>
					<div css={historyViewStyles.titleBlock}>
						{!dispatchLandingPage && (
							<Typography id="history-heading" element="h1" variant="headingLg">
								History
							</Typography>
						)}
					</div>
					{!isLoading && !error && totalItems > limit && (
						<HistoryPagination
							currentPage={currentPage}
							totalItems={totalItems}
							onPageChange={handlePageChange}
							limit={limit}
						/>
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
