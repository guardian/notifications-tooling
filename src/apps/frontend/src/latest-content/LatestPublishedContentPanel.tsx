import {
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { useLatestPublishedContent } from '../hooks/useLatestPublishedContent';
import { latestPublishedContentTheme } from '../themes';
import { LatestPublishedContentCard } from './LatestPublishedContentCard';

const tableColumns = { sm: 'minmax(0, 1fr)' } as const;

export const LatestPublishedContentPanel = () => {
	const latestPublishedContent = useLatestPublishedContent();
	const content = latestPublishedContent.data ?? [];

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
			>
				<TableHeader cssOverrides={latestPublishedContentTheme.tableHeader}>
					<TableColumnHeader isRowHeader>
						Last published content
					</TableColumnHeader>
				</TableHeader>
				<TableBody>
					{content.map((item) => (
						<LatestPublishedContentCard key={item.id} content={item} />
					))}
				</TableBody>
			</Table>
		</div>
	);
};
