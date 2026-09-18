import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { TableCell, TableRow } from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { useRelativeTime } from '../hooks/use-relative-time';
import { latestPublishedContentTheme } from '../themes';
import { ExternalLink } from '../ui/ExternalLink';
import { FlagPair } from '../ui/FlagPair';
import { getPillarColor } from '../utils/pillar-colors';
import type { LatestPublishedContentItem } from './latest-published-content';

interface LatestPublishedContentCardProps {
	content: LatestPublishedContentItem;
}

export const LatestPublishedContentCard = ({
	content,
}: LatestPublishedContentCardProps) => {
	const {
		id,
		headline,
		url,
		imageUrl,
		section,
		pillarName,
		pillarId,
		homeEdition,
		targetAudience,
	} = content;
	const pillarColor = getPillarColor(pillarId);
	const publishedAt = useRelativeTime(content.publishedAt);

	return (
		<TableRow id={id}>
			<TableCell cssOverrides={latestPublishedContentTheme.card}>
				<div css={latestPublishedContentTheme.cardDetails}>
					<div css={latestPublishedContentTheme.cardMeta}>
						<Typography
							variant="bodyBoldXs"
							cssOverrides={latestPublishedContentTheme.sectionLabel(
								pillarColor,
							)}
						>
							{section} / {pillarName}
						</Typography>
						{publishedAt && (
							<Typography
								variant="bodyXs"
								cssOverrides={latestPublishedContentTheme.published}
							>
								Published {publishedAt.label}
							</Typography>
						)}
						<div css={latestPublishedContentTheme.audience}>
							<FlagPair from={homeEdition} to={targetAudience} />
						</div>
					</div>

					<div css={latestPublishedContentTheme.cardHeadline}>
						<ExternalLink href={url}>
							<Typography
								variant="bodySm"
								element="span"
								cssOverrides={latestPublishedContentTheme.headline}
							>
								{headline}
							</Typography>
						</ExternalLink>
					</div>
				</div>

				<div css={latestPublishedContentTheme.cardActions}>
					{imageUrl ? (
						<img
							src={imageUrl}
							alt=""
							css={latestPublishedContentTheme.thumbnail}
						/>
					) : (
						<div css={latestPublishedContentTheme.thumbnailFallback}>
							<Icon size="sm" symbol="image" />
							<Typography variant="bodyXs">No image</Typography>
						</div>
					)}

					<div css={latestPublishedContentTheme.createButtonSlot}>
						<Button
							variant="tertiary"
							size="sm"
							cssOverrides={latestPublishedContentTheme.createButton}
						>
							<Icon size="sm" symbol="notifications" />
							Create
						</Button>
					</div>
				</div>
			</TableCell>
		</TableRow>
	);
};
