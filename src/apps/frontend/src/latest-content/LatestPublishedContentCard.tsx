import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import {
	IntendedAudienceSignifier,
	mapTagsToSourceAndTarget,
} from '@guardian/stand/IntendedAudienceSignifier';
import { TableCell, TableRow } from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { useRelativeTime } from '../hooks/useRelativeTime';
import { latestPublishedContentTheme } from '../themes';
import { ExternalLink } from '../ui/ExternalLink';
import { getPillarColor } from '../utils/pillar-colors';
import type { LatestPublishedContentItem } from './latest-published-content';

interface LatestPublishedContentCardProps {
	content: LatestPublishedContentItem;
	onCreate: () => void;
}

export const LatestPublishedContentCard = ({
	content,
	onCreate,
}: LatestPublishedContentCardProps) => {
	const { id, headline, url, imageUrl, section, pillarName, pillarId, tags } =
		content;
	const pillarColor = getPillarColor(pillarId);
	const publishedAt = useRelativeTime(content.publishedAt);
	const intendedAudience = mapTagsToSourceAndTarget(tags);

	return (
		<TableRow id={id}>
			<TableCell cssOverrides={latestPublishedContentTheme.card}>
				<div css={latestPublishedContentTheme.cardDetails}>
					<div css={latestPublishedContentTheme.cardMeta}>
						<Typography
							variant="bodyXs"
							cssOverrides={latestPublishedContentTheme.sectionLabel(
								pillarColor,
							)}
						>
							<span css={latestPublishedContentTheme.sectionName}>
								{section}
							</span>
							{pillarName ? ` / ${pillarName}` : null}
						</Typography>
						{publishedAt && (
							<Typography
								variant="bodyXs"
								cssOverrides={latestPublishedContentTheme.published}
							>
								Published{' '}
								<time
									dateTime={publishedAt.iso8601}
									title={publishedAt.formattedAbsoluteTime}
									css={latestPublishedContentTheme.publishedRelative}
								>
									{publishedAt.label}
								</time>
							</Typography>
						)}
						{intendedAudience && (
							<IntendedAudienceSignifier {...intendedAudience} />
						)}
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
							onPress={onCreate}
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
