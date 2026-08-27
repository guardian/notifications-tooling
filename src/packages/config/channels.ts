/**
 * The delivery channels the broker supports. `newsletter` is delivered via
 * Braze email; `app-push` via FCM (Android) and APNS (iOS).
 */
export enum NotificationChannel {
	Newsletter = 'newsletter',
	AppPushNotification = 'app-push',
}

/**
 * The limits that apply to one piece of notification text. They are distinct
 * numbers with distinct owners; collapsing them is what makes a notification an
 * editor is permitted to compose fail on send.
 */
export interface ContentFieldLimits {
	/** Editorial's preferred length. The UI badges text within it. */
	recommended: number;
	/**
	 * Editorial's stated maximum. Guidance only — the UI does not block on it and
	 * the broker does not reject past it.
	 */
	editorialLimit: number;
	/**
	 * The length the broker rejects past. Guards against absurd input only, so
	 * most fields have none.
	 */
	validationCap?: number;
}

export const notificationChannelContentLimits = {
	[NotificationChannel.AppPushNotification]: {
		title: { recommended: 50, editorialLimit: 50, validationCap: 50 },
		body: { recommended: 90, editorialLimit: 120 },
	},
	[NotificationChannel.Newsletter]: {
		title: { recommended: 46, editorialLimit: 70 },
		body: { recommended: 85, editorialLimit: 140 },
	},
} as const satisfies Record<
	NotificationChannel,
	Record<'title' | 'body', ContentFieldLimits>
>;
