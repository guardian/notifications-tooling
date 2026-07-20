import { acceptedNotificationSchema } from './accepted-notification';
import { channelConstraintsSchema } from './channel-constraints';
import { notificationChannelSchema } from './notification-channel';
import { notificationPushRequestJsonSchema } from './notification-push-request';
import { notificationValidationErrorSchema } from './notification-validation-error';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	NotificationChannel: notificationChannelSchema,
	NotificationPushRequest: notificationPushRequestJsonSchema,
	AcceptedNotification: acceptedNotificationSchema,
	NotificationValidationError: notificationValidationErrorSchema,
	ChannelConstraints: channelConstraintsSchema,
} as const;
