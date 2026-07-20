import { acceptedNotificationSchema } from './accepted-notification';
import { notificationPushRequestJsonSchema } from './notification-push-request';
import { notificationValidationErrorSchema } from './notification-validation-error';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	NotificationPushRequest: notificationPushRequestJsonSchema,
	AcceptedNotification: acceptedNotificationSchema,
	NotificationValidationError: notificationValidationErrorSchema,
} as const;
