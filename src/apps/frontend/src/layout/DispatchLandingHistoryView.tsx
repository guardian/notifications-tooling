import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { HistoryPagination } from '../history/HistoryPagination';
import { HistoryTable } from '../history/HistoryTable';
import type { HistoryViewProps } from '../history/HistoryView';
import { historyViewStyles, layoutMainTheme } from '../themes';

export const DispatchLandingHistoryView = ({
	notifications = [],
	totalItems = 0,
	isLoading = false,
	limit,
	error,
	currentPage,
	handlePageChange,
}: HistoryViewProps) => {
	return (
		<Layout.Main theme={layoutMainTheme}>
			<section
				aria-labelledby="history-heading"
				css={historyViewStyles.container}
			>
				<div css={historyViewStyles.header}>
					<Typography variant="headingXl">Last 24-hour activity</Typography>
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
					<Typography variant="bodyMd">Loading 24 hour history...</Typography>
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
