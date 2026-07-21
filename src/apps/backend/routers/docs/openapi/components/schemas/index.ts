import { acceptedNotificationSchema } from './accepted-notification';
import { healthStatusSchema } from './health-status';
import { notificationChannelSchema } from './notification-channel';
import { notificationPlanAcceptanceSchema } from './notification-plan-acceptance';
import { notificationSendRequestJsonSchema } from './notification-send-request';
import { notificationValidationErrorSchema } from './notification-validation-error';
import { notificationValidationIssueSchema } from './notification-validation-issue';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	HealthStatus: healthStatusSchema,
	NotificationChannel: notificationChannelSchema,
	NotificationSendRequest: notificationSendRequestJsonSchema,
	NotificationPlanAcceptance: notificationPlanAcceptanceSchema,
	AcceptedNotification: acceptedNotificationSchema,
	NotificationValidationIssue: notificationValidationIssueSchema,
	NotificationValidationError: notificationValidationErrorSchema,
} as const;
