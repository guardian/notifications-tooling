import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import type { ResolvedArticle } from '@models';
import { getPillarColor } from '../pillar-colors';
import { articlePreviewCardTheme } from '../themes';
import { useRelativeTime } from '../use-relative-time';

interface ArticlePreviewCardProps {
	content: ResolvedArticle;
	showThumbnail?: boolean;
}

export const ArticlePreviewCard = ({
	content,
	showThumbnail = true,
}: ArticlePreviewCardProps) => {
	const {
		sectionName,
		pillarId,
		pillarName,
		webTitle,
		fields,
		webPublicationDate,
		webUrl,
	} = content;
	const headline = fields?.headline ?? webTitle;
	const thumbnail = fields?.thumbnail;
	const pillarColor = getPillarColor(pillarId);
	const publishedAt = useRelativeTime(webPublicationDate);

	return (
		<div css={articlePreviewCardTheme.card}>
			<div css={articlePreviewCardTheme.details}>
				{(sectionName ?? pillarName) && (
					<Typography
						cssOverrides={articlePreviewCardTheme.sectionLabel(pillarColor)}
					>
						{sectionName && (
							<Typography
								variant="bodyBoldXs"
								cssOverrides={articlePreviewCardTheme.sectionLabel(pillarColor)}
							>
								{sectionName}
							</Typography>
						)}
						{sectionName && pillarName && ' / '}
						{pillarName}
					</Typography>
				)}

				{publishedAt && (
					<Typography
						variant="bodyXs"
						element="p"
						cssOverrides={articlePreviewCardTheme.published}
					>
						Published{' '}
						<time
							dateTime={publishedAt.iso8601}
							title={publishedAt.formattedAbsoluteTime}
							css={articlePreviewCardTheme.publishedRelative}
						>
							{publishedAt.label}
						</time>
					</Typography>
				)}

				<Typography
					variant="bodyLg"
					element="h3"
					cssOverrides={articlePreviewCardTheme.headline}
				>
					{headline}
				</Typography>

				<Link
					cssOverrides={articlePreviewCardTheme.url}
					href={webUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					{webUrl}
				</Link>
			</div>

			{thumbnail && showThumbnail && (
				<img
					src={thumbnail}
					alt={`Thumbnail for ${headline}`}
					css={articlePreviewCardTheme.thumbnail}
				/>
			)}
		</div>
	);
};
