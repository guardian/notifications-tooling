import {
	notificationSendAppPushExample,
	notificationSendNewsletterExample,
} from './notification-send-request';

/** Reusable example objects referenced via `#/components/examples/*`. */
export const examples = {
	NotificationSendNewsletter: notificationSendNewsletterExample,
	NotificationSendAppPush: notificationSendAppPushExample,
} as const;
