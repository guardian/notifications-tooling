import { articleResolutionErrorSchema } from './article-resolution-error';
import {
	channelAudiencesSchema,
	emailChannelConfigSchema,
} from './channel-audiences';
import { channelConstraintsSchema } from './channel-constraints';
import { emailPreviewErrorSchema } from './email-preview-error';
import { emailRenderingContentErrorSchema } from './email-rendering-content-error';
import { healthStatusSchema } from './health-status';
import { insufficientPermissionsSchema } from './insufficient-permissions';
import { notificationSchema } from './notification';
import { notificationChannelSchema } from './notification-channel';
import { notificationConflictErrorSchema } from './notification-conflict-error';
import { notificationDispatchSchema } from './notification-dispatch';
import { notificationNotFoundSchema } from './notification-not-found';
import { notificationSendRequestJsonSchema } from './notification-send-request';
import { notificationTestSendRequestJsonSchema } from './notification-test-send-request';
import { notificationUnprocessableErrorSchema } from './notification-unprocessable-error';
import { notificationValidationErrorSchema } from './notification-validation-error';
import { notificationValidationIssueSchema } from './notification-validation-issue';
import { resolveArticleRequestSchema } from './resolve-article-request';
import { resolvedArticleSchema } from './resolved-article';
import { unauthenticatedSchema } from './unauthenticated';
import { userResponseSchema, userSchema } from './user';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	HealthStatus: healthStatusSchema,
	NotificationChannel: notificationChannelSchema,
	Notification: notificationSchema,
	NotificationDispatch: notificationDispatchSchema,
	NotificationNotFound: notificationNotFoundSchema,
	NotificationConflictError: notificationConflictErrorSchema,
	NotificationSendRequest: notificationSendRequestJsonSchema,
	NotificationTestSendRequest: notificationTestSendRequestJsonSchema,
	NotificationValidationIssue: notificationValidationIssueSchema,
	NotificationValidationError: notificationValidationErrorSchema,
	EmailRenderingContentError: emailRenderingContentErrorSchema,
	NotificationUnprocessableError: notificationUnprocessableErrorSchema,
	ChannelConstraints: channelConstraintsSchema,
	ChannelAudiences: channelAudiencesSchema,
	EmailChannelConfig: emailChannelConfigSchema,
	ResolveArticleRequest: resolveArticleRequestSchema,
	ResolvedArticle: resolvedArticleSchema,
	ArticleResolutionError: articleResolutionErrorSchema,
	User: userSchema,
	UserResponse: userResponseSchema,
	Unauthenticated: unauthenticatedSchema,
	InsufficientPermissions: insufficientPermissionsSchema,
	EmailPreviewErrorSchema: emailPreviewErrorSchema,
} as const;
