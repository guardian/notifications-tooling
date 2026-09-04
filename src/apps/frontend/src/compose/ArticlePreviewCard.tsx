import { Link } from '@guardian/stand/Link';
import { Typography } from '@guardian/stand/Typography';
import type { ResolvedArticle } from '@models';
import { useRelativeTime } from '../hooks/use-relative-time';
import { articlePreviewCardTheme } from '../themes';
import { getArticleThumbnail } from '../utils/article-thumbnail';
import { getPillarColor } from '../utils/pillar-colors';

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
		blocks,
		type,
	} = content;
	const liveblogMainBlock = type === 'liveblog' ? blocks?.main : undefined;
	const isLiveblog = !!liveblogMainBlock?.id;
	const headline = fields?.headline ?? webTitle;
	const thumbnail = getArticleThumbnail(content);
	const pillarColor = getPillarColor(pillarId);
	const publishedAt = useRelativeTime(
		isLiveblog ? fields?.lastModified : webPublicationDate,
	);

	return (
		<div css={articlePreviewCardTheme.card(isLiveblog)}>
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

				{isLiveblog && (
					<div css={articlePreviewCardTheme.liveStatus}>
						<Typography
							variant="bodyBoldXs"
							element="span"
							cssOverrides={articlePreviewCardTheme.liveIndicator}
						>
							<span
								css={articlePreviewCardTheme.liveIndicatorDot}
								aria-hidden="true"
							/>
							Live
						</Typography>
						{publishedAt && (
							<Typography
								variant="bodyXs"
								element="span"
								cssOverrides={articlePreviewCardTheme.updated}
							>
								Updated{' '}
								<time
									dateTime={publishedAt.iso8601}
									title={publishedAt.formattedAbsoluteTime}
									css={articlePreviewCardTheme.publishedRelative}
								>
									{publishedAt.label}
								</time>
							</Typography>
						)}
					</div>
				)}

				{publishedAt && !isLiveblog && (
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

				{liveblogMainBlock?.id && (
					<Typography
						variant="bodyBoldXs"
						element="p"
						cssOverrides={articlePreviewCardTheme.liveblogBlockId}
					>
						Liveblog block ID: {liveblogMainBlock.id}
					</Typography>
				)}

				<Link
					cssOverrides={articlePreviewCardTheme.url}
					href={webUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					{webUrl}
				</Link>
			</div>

			{thumbnail.src && showThumbnail && (
				<img
					src={thumbnail.src}
					alt={thumbnail.alt ?? `Thumbnail for ${headline}`}
					css={articlePreviewCardTheme.thumbnail(isLiveblog)}
				/>
			)}
		</div>
	);
};
