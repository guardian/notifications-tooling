import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Avatar } from '@guardian/stand/Avatar';
import { Link } from '@guardian/stand/Link';
import { toastQueue, ToastRegion } from '@guardian/stand/Toast';
import type { DisplayAppAlertTopicEditionId } from '@models';
import { useContext, useEffect, useRef } from 'react';
import { ConfigContext } from './config/ConfigContext';
import type { HistoryNotification } from './history/HistoryView';
import { useNotificationHistory } from './hooks/useNotificationHistory';
import type { NotificationSummary } from './schemas';
import { FlagAtom } from './ui/FlagAtom';
import { darkTooltipTheme, Tooltip } from './ui/Tooltip';
import {
	getSenderDisplayName,
	mapNotificationToHistoryNotification,
} from './utils/notification-history-mapper';

const channelLabel = {
	'app-push': 'an app alert',
	newsletter: 'a newsletter email',
} as const;
const editionNames: Record<DisplayAppAlertTopicEditionId, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
	EU: 'Europe',
	INT: 'International',
};

const toastLinkStyles = css({
	display: 'block',
	maxWidth: '100%',
	overflowWrap: 'anywhere',
	textDecoration: 'underline',
	textDecorationSkipInk: 'auto',
	textDecorationStyle: 'solid',
	textDecorationThickness: '0%',
	textUnderlineOffset: '0%',
});
const toastTitleStyles = css({
	display: 'flex',
	alignItems: 'center',
	gap: '8px',
});
const toastAvatarStyles = css({
	borderWidth: 1,
	borderStyle: 'solid',
	borderColor: semanticColors.border.strongInverse,
	width: '1.5rem',
	height: '1.5rem',
	fontSize: '8px',
	flexShrink: 0,
});
const toastAdditionalInfoStyles = css({
	display: 'flex',
	flexDirection: 'column',
	gap: '8px',
});
const toastAudienceStyles = css({
	display: 'flex',
	alignItems: 'center',
	gap: '4px',
});
const toastFlagStyles = css({
	display: 'flex',
	alignItems: 'center',
	lineHeight: 0,
	'& > svg': {
		display: 'block',
	},
});
const toastTheme = {
	shared: {
		content: {
			gap: '8px',
			titleTypography: {
				letterSpacing: '0px',
			},
			additionalInfoTypography: {
				font: 'normal 460 0.875rem/1.3 Open Sans',
			},
		},
	},
} as const;
const toastTimeout = 10_000;
const normalizeEmail = (email?: string) => email?.trim().toLowerCase();
const getSenderInitials = (email: string) =>
	getSenderDisplayName(email)
		.split(' ')
		.map((name) => name[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

const isAlertableSend = (
	notification: NotificationSummary,
	currentUserEmail?: string,
) =>
	notification.kind === 'send' &&
	notification.status === 'delivered' &&
	normalizeEmail(notification.createdByEmail) !==
		normalizeEmail(currentUserEmail);

const enqueueNotificationToast = (notification: HistoryNotification) => {
	const senderDisplayName = getSenderDisplayName(notification.sentBy);

	toastQueue.add(
		{
			level: 'information',
			title: (
				<span css={toastTitleStyles}>
					<Tooltip
						label={senderDisplayName}
						trigger={
							<Avatar
								size="sm"
								initials={getSenderInitials(notification.sentBy)}
								cssOverrides={toastAvatarStyles}
							/>
						}
						theme={darkTooltipTheme}
						cssOverrides={css({
							padding: semanticSpacing.stackSm,
						})}
					>
						{senderDisplayName}
					</Tooltip>
					<span>Sent {channelLabel[notification.channel]}</span>
				</span>
			),
			subject: notification.title,
			additionalInfo: (
				<span css={toastAdditionalInfoStyles}>
					<span css={toastAudienceStyles}>
						<span>Sent to</span>
						{notification.sentTo.map((edition) => (
							<span
								key={edition}
								aria-label={editionNames[edition]}
								role="img"
								css={toastFlagStyles}
							>
								<FlagAtom segmentCode={edition} />
							</span>
						))}
					</span>
					<Link
						href={notification.href}
						target="_blank"
						rel="noreferrer"
						cssOverrides={toastLinkStyles}
					>
						{notification.href}
					</Link>
				</span>
			),
			thumbnail: notification.thumbnailUrl ? (
				<img src={notification.thumbnailUrl} alt="" />
			) : undefined,
		},
		{ timeout: toastTimeout },
	);
};

export const NotificationAlert = () => {
	const config = useContext(ConfigContext);
	const seenNotificationIds = useRef<Set<string> | undefined>(undefined);
	const notificationHistory = useNotificationHistory({ limit: 10, offset: 0 });

	useEffect(() => {
		if (
			notificationHistory.data === undefined ||
			notificationHistory.isPlaceholderData
		) {
			return;
		}

		const currentIds = new Set(
			notificationHistory.data.notifications
				.filter(({ status }) => status === 'delivered')
				.map(({ id }) => id),
		);
		const newNotifications = notificationHistory.data.notifications.filter(
			(candidate) =>
				isAlertableSend(candidate, config?.user.email) &&
				seenNotificationIds.current !== undefined &&
				!seenNotificationIds.current.has(candidate.id),
		);

		seenNotificationIds.current = currentIds;
		for (const newNotification of newNotifications) {
			const notification =
				mapNotificationToHistoryNotification(newNotification);
			if (!notification) {
				continue;
			}

			enqueueNotificationToast(notification);
		}
	}, [
		config?.user.email,
		notificationHistory.data,
		notificationHistory.dataUpdatedAt,
		notificationHistory.isPlaceholderData,
	]);

	return <ToastRegion toastProps={{ theme: toastTheme }} />;
};
