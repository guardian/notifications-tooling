import { css } from '@emotion/react';
import { Link } from '@guardian/stand/Link';
import { toastQueue, ToastRegion } from '@guardian/stand/Toast';
import { useContext, useEffect, useRef } from 'react';
import { ConfigContext } from './config/ConfigContext';
import { useNotificationHistory } from './hooks/useNotificationHistory';
import type { NotificationSummary } from './schemas';
import {
	getSenderDisplayName,
	mapNotificationToHistoryNotification,
} from './utils/notification-history-mapper';

const channelLabel = {
	'app-push': 'an app alert',
	newsletter: 'a newsletter email',
} as const;

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

const isAlertableSend = (
	notification: NotificationSummary,
	currentUserEmail?: string,
) =>
	notification.kind === 'send' &&
	notification.status === 'delivered' &&
	notification.createdByEmail !== currentUserEmail;

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
			notificationHistory.data.notifications.map(({ id }) => id),
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

			toastQueue.add(
				{
					level: 'information',
					title: `${getSenderDisplayName(notification.sentBy)} sent ${channelLabel[notification.channel]}`,
					subject: notification.title,
					additionalInfo: (
						<Link
							href={notification.href}
							target="_blank"
							rel="noreferrer"
							cssOverrides={toastLinkStyles}
						>
							{notification.href}
						</Link>
					),
					thumbnail: notification.thumbnailUrl ? (
						<img src={notification.thumbnailUrl} alt="" />
					) : undefined,
				},
				{ timeout: toastTimeout },
			);
		}
	}, [
		config?.user.email,
		notificationHistory.data,
		notificationHistory.dataUpdatedAt,
		notificationHistory.isPlaceholderData,
	]);

	return <ToastRegion toastProps={{ theme: toastTheme }} />;
};
