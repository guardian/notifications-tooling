import { acceptedNotificationSchema } from './accepted-notification';
import { acceptedTestNotificationSchema } from './accepted-test-notification';
import { channelAudiencesSchema } from './channel-audiences';
import { channelConstraintsSchema } from './channel-constraints';
import { healthStatusSchema } from './health-status';
import { insufficientPermissionsSchema } from './insufficient-permissions';
import { notificationChannelSchema } from './notification-channel';
import { notificationPlanAcceptanceSchema } from './notification-plan-acceptance';
import { notificationSendRequestJsonSchema } from './notification-send-request';
import { notificationTestSendRequestJsonSchema } from './notification-test-send-request';
import { notificationValidationErrorSchema } from './notification-validation-error';
import { notificationValidationIssueSchema } from './notification-validation-issue';
import { unauthenticatedSchema } from './unauthenticated';
import { userResponseSchema, userSchema } from './user';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	HealthStatus: healthStatusSchema,
	NotificationChannel: notificationChannelSchema,
	NotificationSendRequest: notificationSendRequestJsonSchema,
	NotificationTestSendRequest: notificationTestSendRequestJsonSchema,
	NotificationPlanAcceptance: notificationPlanAcceptanceSchema,
	AcceptedNotification: acceptedNotificationSchema,
	AcceptedTestNotification: acceptedTestNotificationSchema,
	NotificationValidationIssue: notificationValidationIssueSchema,
	NotificationValidationError: notificationValidationErrorSchema,
	ChannelConstraints: channelConstraintsSchema,
	ChannelAudiences: channelAudiencesSchema,
	User: userSchema,
	UserResponse: userResponseSchema,
	Unauthenticated: unauthenticatedSchema,
	InsufficientPermissions: insufficientPermissionsSchema,
} as const;
