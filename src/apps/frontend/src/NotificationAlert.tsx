import { useContext, useEffect, useRef, useState } from 'react';
import { ConfigContext } from './config/ConfigContext';
import type { HistoryNotification } from './history/HistoryView';
import { useNotificationHistory } from './hooks/useNotificationHistory';
import type { NotificationSummary } from './schemas';
import { NewNotificationToast } from './ui/NewNotificationToast';
import { mapNotificationToHistoryNotification } from './utils/notification-history-mapper';

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
	const [notification, setNotification] = useState<HistoryNotification>();
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
		const newNotification = notificationHistory.data.notifications.find(
			(candidate) =>
				isAlertableSend(candidate, config?.user.email) &&
				seenNotificationIds.current !== undefined &&
				!seenNotificationIds.current.has(candidate.id),
		);

		seenNotificationIds.current = currentIds;
		if (newNotification) {
			setNotification(mapNotificationToHistoryNotification(newNotification));
		}
	}, [
		config?.user.email,
		notificationHistory.data,
		notificationHistory.dataUpdatedAt,
		notificationHistory.isPlaceholderData,
	]);

	return notification ? (
		<NewNotificationToast
			notification={notification}
			onDismiss={() => setNotification(undefined)}
		/>
	) : null;
};
