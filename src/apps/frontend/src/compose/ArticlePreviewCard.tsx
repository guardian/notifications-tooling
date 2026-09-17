import { Typography } from '@guardian/stand/Typography';
import type { CapiBlock, ResolvedArticle } from '@models';
import { useRelativeTime } from '../hooks/useRelativeTime';
import { articlePreviewCardTheme } from '../themes';
import { ExternalLink } from '../ui/ExternalLink';
import { getArticlePresentation } from '../utils/article-presentation';
import { getPillarColor } from '../utils/pillar-colors';

interface ArticlePreviewCardProps {
	article: ResolvedArticle;
	requestedUrl?: string;
	requestedBlock?: CapiBlock;
	showThumbnail?: boolean;
}

export const ArticlePreviewCard = ({
	article,
	requestedUrl,
	requestedBlock,
	showThumbnail = true,
}: ArticlePreviewCardProps) => {
	const { sectionName, pillarId, pillarName } = article;
	const {
		headline,
		isLiveblog,
		linkUrl,
		liveblogBlock,
		publishedDate,
		thumbnail,
	} = getArticlePresentation({ article, requestedUrl, requestedBlock });
	const pillarColor = getPillarColor(pillarId);
	const publishedAt = useRelativeTime(publishedDate);

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

				{liveblogBlock?.id && (
					<Typography
						variant="bodyBoldXs"
						element="p"
						cssOverrides={articlePreviewCardTheme.liveblogBlockId}
					>
						Liveblog block ID: {liveblogBlock.id}
					</Typography>
				)}

				<ExternalLink cssOverrides={articlePreviewCardTheme.url} href={linkUrl}>
					{linkUrl}
				</ExternalLink>
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
