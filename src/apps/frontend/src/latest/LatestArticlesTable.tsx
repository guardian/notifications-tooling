import { Icon } from '@guardian/stand/Icon';
import { Link } from '@guardian/stand/Link';
import {
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import type { ResolvedArticle } from '@models';
import { useRelativeTime } from '../hooks/use-relative-time';
import { historyViewStyles } from '../themes';
import { getArticleThumbnail } from '../utils/article-thumbnail';

interface LatestArticlesTableProps {
	articles: ResolvedArticle[];
}

const tableColumns = {
	sm: 'minmax(0, 1fr)',
	md: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
	lg: 'minmax(280px, 2fr) minmax(160px, 0.8fr) minmax(180px, 1fr)',
} as const;

const PublicationTime = ({ publishedAt }: { publishedAt?: string }) => {
	const publicationTime = useRelativeTime(publishedAt, 'long');

	if (!publicationTime) {
		return <Typography variant="bodySm">Not available</Typography>;
	}

	return (
		<Typography variant="bodySm">
			<time
				dateTime={publicationTime.iso8601}
				title={publicationTime.formattedAbsoluteTime}
			>
				{publicationTime.label}
			</time>
		</Typography>
	);
};

export const LatestArticlesTable = ({ articles }: LatestArticlesTableProps) => (
	<Table
		aria-label="Latest published articles"
		cssOverrides={historyViewStyles.table}
		columns={tableColumns}
		headerVisibleFrom="sm"
	>
		<TableHeader cssOverrides={historyViewStyles.tableHeader}>
			<TableColumnHeader isRowHeader>Article</TableColumnHeader>
			<TableColumnHeader>Section</TableColumnHeader>
			<TableColumnHeader>Published</TableColumnHeader>
		</TableHeader>
		<TableBody>
			{articles.map((article) => {
				const thumbnail = getArticleThumbnail(article);

				return (
					<TableRow
						key={article.id}
						id={article.id}
						cssOverrides={historyViewStyles.tableRow}
					>
						<TableCell
							gridColumn={{ sm: '1', md: '1' }}
							gridRow={{ md: '1 / span 2', lg: 'auto' }}
							cssOverrides={historyViewStyles.notificationCell}
						>
							<div css={historyViewStyles.notification}>
								{thumbnail.src ? (
									<img
										src={thumbnail.src}
										alt=""
										css={historyViewStyles.thumbnail}
									/>
								) : (
									<div css={historyViewStyles.thumbnailFallback}>
										<Icon size="sm" symbol="image" />
										<Typography variant="bodyXs">No image</Typography>
									</div>
								)}
								<div css={historyViewStyles.notificationDetails}>
									<Link
										href={article.webUrl}
										cssOverrides={historyViewStyles.title}
									>
										{article.fields?.headline ?? article.webTitle}
									</Link>
									<Typography
										variant="bodyXs"
										cssOverrides={historyViewStyles.channel}
									>
										{article.type}
									</Typography>
								</div>
							</div>
						</TableCell>
						<TableCell
							gridColumn={{ md: '2', lg: '2' }}
							gridRow={{ md: '1', lg: 'auto' }}
							cssOverrides={historyViewStyles.metadataCell(1)}
						>
							<span css={historyViewStyles.compactLabel} aria-hidden="true">
								Section:{' '}
							</span>
							<span css={historyViewStyles.metadataValue}>
								{article.sectionName ?? 'Not available'}
							</span>
						</TableCell>
						<TableCell
							gridColumn={{ md: '2', lg: '3' }}
							gridRow={{ md: '2', lg: 'auto' }}
							cssOverrides={historyViewStyles.metadataCell(2)}
						>
							<span css={historyViewStyles.compactLabel} aria-hidden="true">
								Published:{' '}
							</span>
							<span css={historyViewStyles.metadataValue}>
								<PublicationTime publishedAt={article.webPublicationDate} />
							</span>
						</TableCell>
					</TableRow>
				);
			})}
		</TableBody>
	</Table>
);

export const LatestArticlesTableSkeleton = () => (
	<div role="status" aria-label="Loading latest articles" aria-busy="true">
		<Table
			aria-label="Loading latest published articles"
			cssOverrides={historyViewStyles.table}
			columns={tableColumns}
			headerVisibleFrom="sm"
		>
			<TableHeader cssOverrides={historyViewStyles.tableHeader}>
				<TableColumnHeader isRowHeader>Article</TableColumnHeader>
				<TableColumnHeader>Section</TableColumnHeader>
				<TableColumnHeader>Published</TableColumnHeader>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }, (_, index) => (
					<TableRow
						key={index}
						id={`latest-article-skeleton-${index}`}
						cssOverrides={historyViewStyles.tableRow}
					>
						<TableCell cssOverrides={historyViewStyles.notificationCell}>
							<div css={historyViewStyles.notification} aria-hidden="true">
								<span css={historyViewStyles.skeletonThumbnail} />
								<div css={historyViewStyles.skeletonNotificationDetails}>
									<span css={historyViewStyles.skeletonLine('85%')} />
									<span css={historyViewStyles.skeletonLine('40%')} />
								</div>
							</div>
						</TableCell>
						{[1, 2].map((column) => (
							<TableCell
								key={column}
								cssOverrides={historyViewStyles.metadataCell(column)}
							>
								<span
									css={historyViewStyles.skeletonMetadata}
									aria-hidden="true"
								/>
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	</div>
);
