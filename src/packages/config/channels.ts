/**
 * The delivery channels the broker supports. `newsletter` is delivered via
 * Braze email; `app-push` via FCM (Android) and APNS (iOS).
 */
export enum NotificationChannel {
	Newsletter = 'newsletter',
	AppPushNotification = 'app-push',
}

/**
 * The three limits that apply to one piece of notification text. They are
 * distinct numbers with distinct owners; collapsing them is what makes a
 * notification an editor is permitted to compose fail on send.
 */
export interface ContentFieldLimits {
	/** Editorial's preferred length. The UI warns past it. */
	recommended: number;
	/**
	 * Editorial's stated maximum. The UI badges it but deliberately does not
	 * block, so text past it must still be accepted by the broker.
	 */
	editorialLimit: number;
	/** The length the broker rejects past. Guards against absurd input only. */
	validationCap: number;
}

export const notificationChannelContentLimits = {
	// Push limits come from the notification providers (FCM/APNS), not from
	// editorial, so there is no room between guidance and the cap. All three are
	// the same number until editorial supplies distinct ones.
	[NotificationChannel.AppPushNotification]: {
		title: { recommended: 50, editorialLimit: 50, validationCap: 50 },
		body: { recommended: 90, editorialLimit: 120, validationCap: 200 },
	},
	[NotificationChannel.Newsletter]: {
		title: { recommended: 46, editorialLimit: 70, validationCap: 150 },
		body: { recommended: 85, editorialLimit: 140, validationCap: 250 },
	},
} as const satisfies Record<
	NotificationChannel,
	Record<'title' | 'body', ContentFieldLimits>
>;
