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
 * The push limits mirror the existing producer, the Breaking News tool in
 * `guardian/facia-tool`, which posts to mobile-n10n's `/push/topic`. That tool
 * derives a short, fixed `title` (e.g. "Breaking news") and treats the `body`
 * (the article headline) with soft warnings: a ~90-char recommendation and a
 * ~120-char point beyond which "some characters might not show". mobile-n10n
 * itself enforces no per-field caps (only the ~4KB APNS payload ceiling), so we
 * adopt 120 as the safe `body` limit and keep `title` comfortably above the
 * short labels facia-tool emits.
 *
 * NOTE: These are sensible stub limits for the initial version and would
 * eventually be surfaced via `GET /v1/channels/constraints`.
 */
export const notificationChannelContentLimits = {
	[NotificationChannel.AppPushNotification]: {
		title: { maxLength: 50 },
		body: { maxLength: 120 },
	},
	[NotificationChannel.Newsletter]: {
		title: { maxLength: 100 },
		body: { maxLength: 280 },
	},
} as const;
