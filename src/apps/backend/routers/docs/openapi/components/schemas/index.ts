import { acceptedNotificationSchema } from './accepted-notification';
import { channelConstraintsSchema } from './channel-constraints';
import { healthStatusSchema } from './health-status';
import { notificationChannelSchema } from './notification-channel';
import { notificationPlanAcceptanceSchema } from './notification-plan-acceptance';
import { notificationPushRequestJsonSchema } from './notification-push-request';
import { notificationValidationErrorSchema } from './notification-validation-error';
import { notificationValidationIssueSchema } from './notification-validation-issue';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	HealthStatus: healthStatusSchema,
	NotificationChannel: notificationChannelSchema,
	NotificationPushRequest: notificationPushRequestJsonSchema,
	NotificationPlanAcceptance: notificationPlanAcceptanceSchema,
	AcceptedNotification: acceptedNotificationSchema,
	NotificationValidationIssue: notificationValidationIssueSchema,
	NotificationValidationError: notificationValidationErrorSchema,
	ChannelConstraints: channelConstraintsSchema,
} as const;
