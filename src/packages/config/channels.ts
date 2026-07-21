/**
 * The delivery channels the broker supports. `newsletter` is delivered via
 * Braze email; `app-push-notification` via FCM (Android) and APNS (iOS).
 */
export enum NotificationChannel {
	Newsletter = 'newsletter',
	AppPushNotification = 'app-push-notification',
}

/**
 * Per-channel `title`/`body` length limits. Push goes through FCM/APNS, which
 * truncate alert text aggressively, so it uses stricter caps mirroring the
 * Breaking News tool in `guardian/facia-tool`; newsletter (Braze email) allows
 * more generous copy. Stub values until surfaced via
 * `GET /v1/channels/constraints`.
 */
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
