import {
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import { useLatestPublishedContent } from '../hooks/useLatestPublishedContent';
import { latestPublishedContentTheme } from '../themes';
import { TextLinkButton } from '../ui/TextLinkButton';
import { LatestPublishedContentCard } from './LatestPublishedContentCard';

const tableColumns = { sm: 'minmax(0, 1fr)' } as const;

export const LatestPublishedContentPanel = () => {
	const latestPublishedContent = useLatestPublishedContent();
	const content = latestPublishedContent.data ?? [];
	const [showAll, setShowAll] = useState(false);

	return (
		<div css={latestPublishedContentTheme.panel}>
			<div css={latestPublishedContentTheme.header}>
				<Typography variant="headingXl">Latest published content</Typography>
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
				<TableHeader cssOverrides={latestPublishedContentTheme.tableHeader}>
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
					cssOverrides={latestPublishedContentTheme.tableBody(showAll)}
				>
					{content.map((item) => (
						<LatestPublishedContentCard key={item.id} content={item} />
					))}
				</TableBody>
			</Table>
		</div>
	);
};
