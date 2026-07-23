import { acceptedNotificationSchema } from './accepted-notification';
import { channelAudiencesSchema } from './channel-audiences';
import { channelConstraintsSchema } from './channel-constraints';
import { healthStatusSchema } from './health-status';
import { notificationChannelSchema } from './notification-channel';
import { notificationPlanAcceptanceSchema } from './notification-plan-acceptance';
import { notificationSendRequestJsonSchema } from './notification-send-request';
import { notificationValidationErrorSchema } from './notification-validation-error';
import { notificationValidationIssueSchema } from './notification-validation-issue';
import { userSchema } from './user';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	HealthStatus: healthStatusSchema,
	NotificationChannel: notificationChannelSchema,
	NotificationSendRequest: notificationSendRequestJsonSchema,
	NotificationPlanAcceptance: notificationPlanAcceptanceSchema,
	AcceptedNotification: acceptedNotificationSchema,
	NotificationValidationIssue: notificationValidationIssueSchema,
	NotificationValidationError: notificationValidationErrorSchema,
	ChannelConstraints: channelConstraintsSchema,
	ChannelAudiences: channelAudiencesSchema,
	User: userSchema,
} as const;
