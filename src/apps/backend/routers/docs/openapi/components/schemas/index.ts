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
import { notificationChannelSchema } from './notification-channel';
import { notificationDispatchOutcomeSchema } from './notification-dispatch-outcome';
import { notificationProviderErrorSchema } from './notification-provider-error';
import { notificationResourceSchema } from './notification-resource';
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
	NotificationSendRequest: notificationSendRequestJsonSchema,
	NotificationTestSendRequest: notificationTestSendRequestJsonSchema,
	NotificationDispatchOutcome: notificationDispatchOutcomeSchema,
	Notification: notificationResourceSchema,
	NotificationValidationIssue: notificationValidationIssueSchema,
	NotificationValidationError: notificationValidationErrorSchema,
	EmailRenderingContentError: emailRenderingContentErrorSchema,
	NotificationUnprocessableError: notificationUnprocessableErrorSchema,
	NotificationProviderError: notificationProviderErrorSchema,
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
