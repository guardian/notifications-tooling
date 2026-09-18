import {
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import { useLatestPublishedContent } from '../hooks/useLatestPublishedContent';
import { DispatchCreateNotificationModal } from '../layout/DispatchCreateNotificationModal';
import { latestPublishedContentTheme } from '../themes';
import { TextLinkButton } from '../ui/TextLinkButton';
import { LatestPublishedContentCard } from './LatestPublishedContentCard';

const tableColumns = { sm: 'minmax(0, 1fr)' } as const;

export const LatestPublishedContentPanel = () => {
	const latestPublishedContent = useLatestPublishedContent();
	const content = latestPublishedContent.data ?? [];
	const [showAll, setShowAll] = useState(false);
	const [isCreateNotificationModalOpen, setIsCreateNotificationModalOpen] =
		useState(false);

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
			</div>
			<DispatchCreateNotificationModal
				isOpen={isCreateNotificationModalOpen}
				onOpenChange={setIsCreateNotificationModalOpen}
			/>
		</>
	);
};
