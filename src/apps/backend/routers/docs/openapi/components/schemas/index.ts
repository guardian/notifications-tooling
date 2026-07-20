import { acceptedNotificationSchema } from './accepted-notification';
import { notificationChannelSchema } from './notification-channel';
import { notificationPushRequestJsonSchema } from './notification-push-request';
import { notificationValidationErrorSchema } from './notification-validation-error';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	NotificationChannel: notificationChannelSchema,
	NotificationPushRequest: notificationPushRequestJsonSchema,
	AcceptedNotification: acceptedNotificationSchema,
	NotificationValidationError: notificationValidationErrorSchema,
} as const;
