import {
	notificationSendAppPushExample,
	notificationSendNewsletterExample,
} from './notification-send-request';
import {
	notificationTestAppPushExample,
	notificationTestNewsletterExample,
} from './notification-test-send-request';

/** Reusable example objects referenced via `#/components/examples/*`. */
export const examples = {
	NotificationSendNewsletter: notificationSendNewsletterExample,
	NotificationSendAppPush: notificationSendAppPushExample,
	NotificationTestNewsletter: notificationTestNewsletterExample,
	NotificationTestAppPush: notificationTestAppPushExample,
} as const;
