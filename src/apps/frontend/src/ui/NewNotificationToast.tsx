import { css, keyframes } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticShadow,
	semanticSizing,
	semanticSpacing,
	semanticTypography,
} from '@guardian/stand';
import { IconButton } from '@guardian/stand/IconButton';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type { HistoryNotification } from '../history/HistoryView';
import { layer, stickyHeaderHeight } from '../themes';

const enter = keyframes({
	from: { opacity: 0, transform: 'translateY(-12px)' },
	to: { opacity: 1, transform: 'translateY(0)' },
});

const channelLabel = {
	'app-push': 'An app alert',
	newsletter: 'A newsletter email',
} as const;

interface NewNotificationToastProps {
	notification: HistoryNotification;
	onDismiss: () => void;
}

export const NewNotificationToast = ({
	notification,
	onDismiss,
}: NewNotificationToastProps) => (
	<div
		role="status"
		aria-live="polite"
		css={css({
			position: 'fixed',
			top: `calc(${stickyHeaderHeight} + ${semanticSpacing.stackSm})`,
			right: semanticSpacing.stackSm,
			left: semanticSpacing.stackSm,
			zIndex: layer.topBar + 1,
			display: 'grid',
			gridTemplateColumns: notification.thumbnailUrl
				? '80px minmax(0, 1fr) auto'
				: 'minmax(0, 1fr) auto',
			gap: semanticSpacing.stackSm,
			alignItems: 'start',
			maxWidth: '420px',
			padding: semanticSpacing.stackSm,
			border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			borderRadius: semanticRadius.cornerSm,
			boxShadow: semanticShadow.raised,
			backgroundColor: semanticColors.bg.raisedLevel1,
			animation: `${enter} 180ms ease-out`,
			[from.sm]: {
				right: semanticSpacing.stackMd,
				left: 'auto',
				width: '420px',
			},
		})}
	>
		{notification.thumbnailUrl && (
			<img
				src={notification.thumbnailUrl}
				alt=""
				css={css({
					width: '80px',
					height: '80px',
					objectFit: 'cover',
				})}
			/>
		)}
		<div css={css({ minWidth: 0 })}>
			<Typography
				element="p"
				variant="bodySm"
				css={css({ marginBottom: semanticSpacing.stackXxs })}
			>
				{channelLabel[notification.channel]} was sent just now by:{' '}
				{notification.sentBy}
			</Typography>
			<a
				href={notification.href}
				target="_blank"
				rel="noreferrer"
				css={css({
					display: 'block',
					color: semanticColors.text.link,
					overflowWrap: 'anywhere',
					font: semanticTypography.headingSm.font,
					letterSpacing: semanticTypography.headingSm.letterSpacing,
				})}
			>
				{notification.title}
			</a>
		</div>
		<IconButton
			ariaLabel="Dismiss notification"
			symbol="close"
			size="sm"
			variant="tertiary"
			onPress={onDismiss}
		/>
	</div>
);
