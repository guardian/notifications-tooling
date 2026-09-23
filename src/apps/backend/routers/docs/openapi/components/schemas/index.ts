import { articleResolutionErrorSchema } from './article-resolution-error';
import { capiUnavailableErrorSchema } from './capi-unavailable-error';
import {
	channelAudiencesSchema,
	emailChannelConfigSchema,
} from './channel-audiences';
import { channelConstraintsSchema } from './channel-constraints';
import { emailPreviewErrorSchema } from './email-preview-error';
import { emailPreviewRequestJsonSchema } from './email-preview-request';
import { emailPreviewResponseJsonSchema } from './email-preview-response';
import { emailRenderingContentErrorSchema } from './email-rendering-content-error';
import { grafanaMetricsSchema } from './grafana-metrics';
import {
	grafanaQueryErrorSchema,
	grafanaQueryResponseSchema,
} from './grafana-query';
import { grafanaQueryRequestJsonSchema } from './grafana-query-request';
import { healthStatusSchema } from './health-status';
import { historyAlertTypesJsonSchema } from './history-alert-types';
import { insufficientPermissionsSchema } from './insufficient-permissions';
import { latestArticleJsonSchema } from './latest-article';
import { latestArticlesResponseJsonSchema } from './latest-articles-response';
import { liveblogBlockSchema } from './liveblog-block';
import { notificationSchema } from './notification';
import { notificationArticleHistorySchema } from './notification-article-history';
import { notificationArticleHistorySendSchema } from './notification-article-history-send';
import { notificationChannelSchema } from './notification-channel';
import { notificationConflictErrorSchema } from './notification-conflict-error';
import { notificationDispatchSchema } from './notification-dispatch';
import { notificationListSchema } from './notification-list';
import { notificationNotFoundSchema } from './notification-not-found';
import { notificationSendRequestJsonSchema } from './notification-send-request';
import { notificationSendersSchema } from './notification-senders';
import { notificationSummarySchema } from './notification-summary';
import { notificationTestSendRequestJsonSchema } from './notification-test-send-request';
import { notificationUnprocessableErrorSchema } from './notification-unprocessable-error';
import { notificationValidationErrorSchema } from './notification-validation-error';
import { notificationValidationIssueSchema } from './notification-validation-issue';
import { resolveArticleRequestSchema } from './resolve-article-request';
import { resolveArticleResponseSchema } from './resolve-article-response';
import { resolvedArticleSchema } from './resolved-article';
import { unauthenticatedSchema } from './unauthenticated';
import { userResponseSchema, userSchema } from './user';

/** Reusable schema objects referenced via `#/components/schemas/*`. */
export const schemas = {
	HealthStatus: healthStatusSchema,
	GrafanaMetrics: grafanaMetricsSchema,
	GrafanaQueryRequest: grafanaQueryRequestJsonSchema,
	GrafanaQueryResponse: grafanaQueryResponseSchema,
	GrafanaQueryError: grafanaQueryErrorSchema,
	NotificationChannel: notificationChannelSchema,
	Notification: notificationSchema,
	NotificationArticleHistory: notificationArticleHistorySchema,
	NotificationArticleHistorySend: notificationArticleHistorySendSchema,
	NotificationSummary: notificationSummarySchema,
	NotificationList: notificationListSchema,
	NotificationSenders: notificationSendersSchema,
	HistoryAlertTypes: historyAlertTypesJsonSchema,
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
	CapiUnavailableError: capiUnavailableErrorSchema,
	LatestArticle: latestArticleJsonSchema,
	LatestArticlesResponse: latestArticlesResponseJsonSchema,
	LiveblogBlock: liveblogBlockSchema,
	ResolveArticleRequest: resolveArticleRequestSchema,
	ResolveArticleResponse: resolveArticleResponseSchema,
	ResolvedArticle: resolvedArticleSchema,
	ArticleResolutionError: articleResolutionErrorSchema,
	User: userSchema,
	UserResponse: userResponseSchema,
	Unauthenticated: unauthenticatedSchema,
	InsufficientPermissions: insufficientPermissionsSchema,
	EmailPreviewErrorSchema: emailPreviewErrorSchema,
	EmailPreviewRequest: emailPreviewRequestJsonSchema,
	EmailPreviewResponse: emailPreviewResponseJsonSchema,
} as const;
