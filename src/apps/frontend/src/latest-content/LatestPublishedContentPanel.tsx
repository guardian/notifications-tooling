import { baseSizing } from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import {
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import type { QueryKey } from '@tanstack/react-query';
import { useState } from 'react';
import { useLatestPublishedContent } from '../hooks/useLatestPublishedContent';
import { DispatchCreateNotificationModal } from '../layout/DispatchCreateNotificationModal';
import { latestPublishedContentTheme } from '../themes';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TextLinkButton } from '../ui/TextLinkButton';
import type { LatestPublishedContentItem } from './latest-published-content';
import { LatestPublishedContentCard } from './LatestPublishedContentCard';

const tableColumns = { sm: 'minmax(0, 1fr)' } as const;

interface LatestPublishedContentPanelProps {
	queryFn?: () => Promise<LatestPublishedContentItem[]>;
	queryKey?: QueryKey;
}

export const LatestPublishedContentPanel = ({
	queryFn,
	queryKey,
}: LatestPublishedContentPanelProps = {}) => {
	const latestPublishedContent = useLatestPublishedContent(queryFn, queryKey);
	const content = latestPublishedContent.data ?? [];
	const [showAll, setShowAll] = useState(false);
	const [isCreateNotificationModalOpen, setIsCreateNotificationModalOpen] =
		useState(false);
	const hasCachedData = latestPublishedContent.data !== undefined;
	const isEmpty = !latestPublishedContent.isPending && content.length === 0;

	return (
		<>
			<div css={latestPublishedContentTheme.panel}>
				<div css={latestPublishedContentTheme.header}>
					<Typography variant="headingXl" element="h2">
						Latest published content
					</Typography>
					<Typography
						variant="bodySm"
						cssOverrides={latestPublishedContentTheme.helpText}
					>
						Choose a recent article from below to create an alert
					</Typography>
				</div>
				{latestPublishedContent.isPending && !hasCachedData ? (
					<div
						role="status"
						aria-label="Loading latest published content"
						aria-busy="true"
						css={latestPublishedContentTheme.loading}
					>
						<LoadingSpinner fontSize={baseSizing.size48Px} />
					</div>
				) : latestPublishedContent.isError && !hasCachedData ? (
					<InlineMessage level="error">
						Unable to load latest published content. Try again.
					</InlineMessage>
				) : isEmpty ? (
					<EmptyState
						title="No published content yet"
						description="Published articles will appear here."
						icon="article"
					/>
				) : (
					<>
						{latestPublishedContent.isRefetchError && (
							<InlineMessage level="error">
								Unable to refresh latest published content. Showing cached
								results.
							</InlineMessage>
						)}
						<Table
							aria-label="Latest published content"
							cssOverrides={latestPublishedContentTheme.list}
							columns={tableColumns}
							headerVisibleFrom="sm"
						>
							<TableHeader
								data-latest-content-table-header
								cssOverrides={latestPublishedContentTheme.tableHeader}
							>
								<TableColumnHeader isRowHeader>
									<div css={latestPublishedContentTheme.tableHeaderContent}>
										<span>Latest published content</span>
										{content.length > 3 && !showAll && (
											<TextLinkButton
												text="Show all"
												textVariant="bodySm"
												onClick={() => setShowAll(true)}
											/>
										)}
									</div>
								</TableColumnHeader>
							</TableHeader>
							<TableBody
								data-latest-content-table-body
								cssOverrides={latestPublishedContentTheme.tableBody(showAll)}
							>
								{content.map((item) => (
									<LatestPublishedContentCard
										key={item.id}
										content={item}
										onCreate={() => setIsCreateNotificationModalOpen(true)}
									/>
								))}
							</TableBody>
						</Table>
					</>
				)}
			</div>
			<DispatchCreateNotificationModal
				isOpen={isCreateNotificationModalOpen}
				onOpenChange={setIsCreateNotificationModalOpen}
			/>
		</>
	);
};
