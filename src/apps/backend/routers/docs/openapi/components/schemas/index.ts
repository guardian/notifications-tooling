import { acceptedNotificationSchema } from './accepted-notification';
import { notificationPushRequestJsonSchema } from './notification-push-request';
import { validationErrorSchema } from './validation-error';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	NotificationPushRequest: notificationPushRequestJsonSchema,
	AcceptedNotification: acceptedNotificationSchema,
	ValidationError: validationErrorSchema,
} as const;
