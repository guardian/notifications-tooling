import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Tile } from '@guardian/stand/Tile';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useRelativeTime } from '../hooks/useRelativeTime';
import type { LatestPublishedContentItem } from '../latest-content/latest-published-content';
import { getAppRoutes, withArticleUrl } from '../routes';
import { dispatchTileModalTheme } from '../themes';
import { ExternalLink } from '../ui/ExternalLink';
import { phoneIphoneIcon } from '../ui/flag-icons';
import { getPillarColor } from '../utils/pillar-colors';

const styles = {
	content: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackSm,
	}),
	preview: css({
		display: 'grid',
		gridTemplateColumns: '92px minmax(0, 1fr) 64px',
		alignItems: 'stretch',
		minHeight: '58px',
		overflow: 'hidden',
		border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderRadius: semanticRadius.cornerXs,
		backgroundColor: semanticColors.bg.base,
	}),
	previewMeta: css({
		display: 'flex',
		minWidth: 0,
		flexDirection: 'column',
		justifyContent: 'center',
		gap: '2px',
		padding: '6px',
		borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		'& > *': {
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
		},
	}),
	section: (color: string) => css({ color, fontSize: '12px' }),
	sectionName: css({ fontWeight: 700 }),
	published: css({ color: semanticColors.text.strong, fontSize: '12px' }),
	publishedRelative: css({ fontWeight: 700 }),
	previewHeadline: css({
		display: 'flex',
		minWidth: 0,
		alignItems: 'flex-start',
		padding: '8px',
	}),
	headline: css({
		display: '-webkit-box',
		overflow: 'hidden',
		fontSize: '12px',
		lineHeight: 1.35,
		color: semanticColors.text.strong,
		WebkitBoxOrient: 'vertical',
		WebkitLineClamp: 2,
	}),
	thumbnail: css({
		width: '60px',
		height: '48px',
		alignSelf: 'center',
		justifySelf: 'center',
		objectFit: 'cover',
		borderRadius: semanticRadius.cornerXs,
	}),
	thumbnailFallback: css({
		display: 'grid',
		width: '60px',
		height: '48px',
		alignSelf: 'center',
		justifySelf: 'center',
		placeItems: 'center',
		color: semanticColors.text.weak,
		backgroundColor: semanticColors.fill.neutralWeak,
		borderRadius: semanticRadius.cornerXs,
	}),
	tileStyles: css({
		width: '100%',
		[from.md]: {
			width: '420px',
		},
	}),
};

interface DispatchCreateNotificationModalProps {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
	content?: LatestPublishedContentItem;
}

export const DispatchCreateNotificationModal = ({
	isOpen,
	onOpenChange,
	content,
}: DispatchCreateNotificationModalProps) => {
	const routes = getAppRoutes();
	const publishedAt = useRelativeTime(content?.publishedAt);
	const selectedArticleUrl = content?.url ?? '';
	const createAppAlertHref = withArticleUrl(
		routes.createAppAlert,
		selectedArticleUrl,
	);
	const createNewsletterEmailHref = withArticleUrl(
		routes.createNewsletterEmail,
		selectedArticleUrl,
	);

	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			theme={dispatchTileModalTheme.modal}
		>
			<Dialog aria-label="Choose an alert type for this content">
				<Dialog.Dismiss ariaLabel="Close Modal" />
				<Dialog.Header>Choose an alert type for this content</Dialog.Header>
				<Dialog.Content>
					<div css={styles.content}>
						{content && (
							<article
								aria-label={`${content.headline} content`}
								css={styles.preview}
							>
								<div css={styles.previewMeta}>
									<Typography
										variant="bodyXs"
										cssOverrides={styles.section(
											getPillarColor(content.pillarId),
										)}
									>
										<span css={styles.sectionName}>{content.section}</span>
										{content.pillarName ? ` / ${content.pillarName}` : null}
									</Typography>
									{publishedAt && (
										<Typography
											variant="bodyXs"
											cssOverrides={styles.published}
										>
											Published{' '}
											<time
												dateTime={publishedAt.iso8601}
												title={publishedAt.formattedAbsoluteTime}
												css={styles.publishedRelative}
											>
												{publishedAt.label}
											</time>
										</Typography>
									)}
								</div>
								<div css={styles.previewHeadline}>
									<ExternalLink href={content.url}>
										<Typography
											variant="bodySm"
											element="span"
											cssOverrides={styles.headline}
										>
											{content.headline}
										</Typography>
									</ExternalLink>
								</div>
								{content.imageUrl ? (
									<img src={content.imageUrl} alt="" css={styles.thumbnail} />
								) : (
									<div css={styles.thumbnailFallback} aria-label="No image">
										<Icon size="sm" symbol="image" />
									</div>
								)}
							</article>
						)}
						{createAppAlertHref && (
							<Tile
								size="sm"
								href={createAppAlertHref}
								icon={phoneIphoneIcon}
								typography="headingMd"
								cssOverrides={styles.tileStyles}
							>
								Create an app alert
							</Tile>
						)}
						<Tile
							size="sm"
							href={createNewsletterEmailHref}
							icon="mail"
							typography="headingMd"
							cssOverrides={styles.tileStyles}
						>
							Create a newsletter email
						</Tile>
					</div>
				</Dialog.Content>
			</Dialog>
		</Modal>
	);
};
