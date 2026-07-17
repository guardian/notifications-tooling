/**
 * The delivery channels the notifications broker currently supports.
 *
 * - `newsletter` is delivered via Braze (email).
 * - `app-push-notification` is delivered via FCM (Android) and APNS (iOS).
 */
export enum NotificationChannel {
	Newsletter = 'newsletter',
	AppPushNotification = 'app-push-notification',
}

/**
 * Per-channel content limits applied to `title` and `body`.
 *
 * `app-push-notification` is delivered through FCM and APNS, both of which
 * truncate the visible alert text aggressively, so we apply the stricter of the
 * two safe limits. `newsletter` is delivered through Braze email, which allows
 * far more generous copy.
 *
 * NOTE: These are sensible stub limits for the initial version and would
 * eventually be surfaced via `GET /v1/channels/constraints`.
 */
export const notificationChannelContentLimits = {
	[NotificationChannel.AppPushNotification]: {
		title: { maxLength: 50 },
		body: { maxLength: 150 },
	},
	[NotificationChannel.Newsletter]: {
		title: { maxLength: 120 },
		body: { maxLength: 5000 },
	},
} as const;
