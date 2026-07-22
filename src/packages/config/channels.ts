/**
 * The delivery channels the broker supports. `newsletter` is delivered via
 * Braze email; `app-push` via FCM (Android) and APNS (iOS).
 */
export enum NotificationChannel {
	Newsletter = 'newsletter',
	AppPushNotification = 'app-push',
}

export const notificationChannelContentLimits = {
	[NotificationChannel.AppPushNotification]: {
		title: { maxLength: 50 },
		body: { maxLength: 120 },
	},
	[NotificationChannel.Newsletter]: {
		title: { maxLength: 70 },
		body: { maxLength: 140 },
	},
} as const;
