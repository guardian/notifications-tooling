import type { Content } from '@guardian/content-api-models/v1/content';
import { Typography } from '@guardian/stand/Typography';
import { getPillarColor } from '../pillar-colors';
import { articlePreviewCardTheme } from '../themes';

interface ArticlePreviewCardProps {
	content: Content;
}

export const ArticlePreviewCard = ({ content }: ArticlePreviewCardProps) => {
	const { sectionName, pillarId, pillarName, webTitle, fields } = content;
	const headline = fields?.headline ?? webTitle;
	const thumbnail = fields?.thumbnail;
	const pillarColor = getPillarColor(pillarId);

	return (
		<div css={articlePreviewCardTheme.card}>
			<div css={articlePreviewCardTheme.details}>
				{(sectionName ?? pillarName) && (
					<Typography
						cssOverrides={articlePreviewCardTheme.sectionLabel(pillarColor)}
					>
						{sectionName && (
							<Typography variant="bodyBoldXs">{sectionName}</Typography>
						)}
						{sectionName && pillarName && ' / '}
						{pillarName}
					</Typography>
				)}

				<Typography
					variant="bodyLg"
					element="h3"
					cssOverrides={articlePreviewCardTheme.headline}
				>
					{headline}
				</Typography>
			</div>

			{thumbnail && (
				<img
					src={thumbnail}
					alt={`Thumbnail for ${headline}`}
					css={articlePreviewCardTheme.thumbnail}
				/>
			)}
		</div>
	);
};
