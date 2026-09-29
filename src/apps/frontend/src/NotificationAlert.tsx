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
});
const toastTimeout = 10_000;

const isAlertableSend = (
	notification: NotificationSummary,
	currentUserEmail?: string,
) =>
	notification.kind === 'send' &&
	notification.status !== 'failed' &&
	notification.createdByEmail !== currentUserEmail;

export const NotificationAlert = () => {
	const config = useContext(ConfigContext);
	const seenNotificationIds = useRef<Set<string> | undefined>(undefined);
	const hasShownFakeToast = useRef(false);
	const notificationHistory = useNotificationHistory({ limit: 10, offset: 0 });

	useEffect(() => {
		if (process.env.NODE_ENV === 'production') {
			return;
		}

		const showFakeToast = () => {
			const href =
				'https://www.theguardian.com/world/2026/sep/28/yemen-fighting-houthis-families-flee-displacement';
			toastQueue.add(
				{
					level: 'information',
					title: 'Claire Phipps sent an app alert',
					subject:
						'Children forced to give up school for work as fighting upends daily life in Yemen',
					additionalInfo: (
						<Link
							href={href}
							target="_blank"
							rel="noreferrer"
							cssOverrides={toastLinkStyles}
						>
							{href}
						</Link>
					),
					thumbnail: (
						<img
							src="https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg"
							alt=""
						/>
					),
				},
				{ timeout: toastTimeout },
			);
		};

		// Temporary local trigger for reviewing incoming toasts.
		if (!hasShownFakeToast.current) {
			hasShownFakeToast.current = true;
			showFakeToast();
		}
		const intervalId = window.setInterval(showFakeToast, 60_000);

		return () => window.clearInterval(intervalId);
	}, []);

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
		const newNotification = notificationHistory.data.notifications.find(
			(candidate) =>
				isAlertableSend(candidate, config?.user.email) &&
				seenNotificationIds.current !== undefined &&
				!seenNotificationIds.current.has(candidate.id),
		);

		seenNotificationIds.current = currentIds;
		if (newNotification) {
			const notification =
				mapNotificationToHistoryNotification(newNotification);
			if (!notification) {
				return;
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

	return <ToastRegion />;
};
