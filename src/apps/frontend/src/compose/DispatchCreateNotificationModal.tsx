import { Icon } from '@guardian/stand/Icon';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Tile } from '@guardian/stand/Tile';
import { Typography } from '@guardian/stand/Typography';
import { useRelativeTime } from '../hooks/useRelativeTime';
import type { LatestPublishedContentItem } from '../latest-content/latest-published-content';
import { getAppRoutes, withArticleUrl } from '../routes';
import { dispatchTileModalStyles, dispatchTileModalTheme } from '../themes';
import { ExternalLink } from '../ui/ExternalLink';
import { phoneIphoneIcon } from '../ui/flag-icons';
import { LiveIndicator } from '../ui/LiveIndicator';
import { getPillarColor } from '../utils/pillar-colors';

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
	const isLiveblog = content?.type === 'liveblog';

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
					<div css={dispatchTileModalStyles.content}>
						{content && (
							<article
								aria-label={`${content.headline} content`}
								css={dispatchTileModalStyles.preview}
							>
								<div css={dispatchTileModalStyles.previewMeta}>
									<Typography
										variant="bodyXs"
										cssOverrides={dispatchTileModalStyles.section(
											getPillarColor(content.pillarId),
										)}
									>
										<span css={dispatchTileModalStyles.sectionName}>
											{content.section}
										</span>
										{content.pillarName ? ` / ${content.pillarName}` : null}
									</Typography>
									{isLiveblog && <LiveIndicator pillarId={content.pillarId} />}
									{publishedAt && (
										<Typography
											variant="bodyXs"
											cssOverrides={dispatchTileModalStyles.published}
										>
											{isLiveblog ? 'Updated ' : 'Published '}
											<time
												dateTime={publishedAt.iso8601}
												title={publishedAt.formattedAbsoluteTime}
												css={dispatchTileModalStyles.publishedRelative}
											>
												{publishedAt.label}
											</time>
										</Typography>
									)}
								</div>
								<div css={dispatchTileModalStyles.previewHeadline}>
									<ExternalLink href={content.url}>
										<Typography
											variant="bodySm"
											element="span"
											cssOverrides={dispatchTileModalStyles.headline}
										>
											{content.headline}
										</Typography>
									</ExternalLink>
								</div>
								{content.imageUrl ? (
									<img
										src={content.imageUrl}
										alt=""
										css={dispatchTileModalStyles.thumbnail}
									/>
								) : (
									<div
										css={dispatchTileModalStyles.thumbnailFallback}
										aria-label="No image"
									>
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
								cssOverrides={dispatchTileModalStyles.tileStyles}
							>
								Create an app alert
							</Tile>
						)}
						<Tile
							size="sm"
							href={createNewsletterEmailHref}
							icon="mail"
							typography="headingMd"
							cssOverrides={dispatchTileModalStyles.tileStyles}
						>
							Create a newsletter email
						</Tile>
					</div>
				</Dialog.Content>
			</Dialog>
		</Modal>
	);
};
