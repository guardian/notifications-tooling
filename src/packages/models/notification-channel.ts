/**
 * The delivery channels the broker supports. `newsletter` is delivered via
 * Braze email; `app-push` via FCM (Android) and APNS (iOS).
 */
export enum NotificationChannel {
	Newsletter = 'newsletter',
	AppPushNotification = 'app-push',
}

export type NotificationChannelId = `${NotificationChannel}`;

export const notificationChannelNames = {
	[NotificationChannel.Newsletter]: 'Newsletter email',
	[NotificationChannel.AppPushNotification]: 'App alert',
} as const satisfies Record<NotificationChannelId, string>;

export const notificationChannelOptions = Object.values(
	NotificationChannel,
).map((id) => ({ id, label: notificationChannelNames[id] }));
