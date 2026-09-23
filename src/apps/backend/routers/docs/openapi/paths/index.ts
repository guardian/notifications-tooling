import {
	channelsAudiencesPath,
	channelsConstraintsPath,
	emailConfigPath,
} from './channels';
import { grafanaMetricsPath, grafanaQueryPath } from './grafana';
import { healthPath } from './health';
import { latestArticlesPath } from './latest-articles';
import { notificationTestsPath } from './notification-tests';
import {
	notificationArticleHistoryPath,
	notificationByIdPath,
	notificationSendersPath,
	notificationsPath,
} from './notifications';
import { emailPreviewPath } from './preview';
import { resolveArticlePath } from './resolve-article';
import { userPath } from './user';

/** The `paths` block of the OpenAPI document, keyed by route. */
export const paths = {
	'/health': healthPath,
	'/metrics': grafanaMetricsPath,
	'/query': grafanaQueryPath,
	'/v1/channels/constraints': channelsConstraintsPath,
	'/v1/channels/audiences': channelsAudiencesPath,
	'/v1/channels/config/email': emailConfigPath,
	'/v1/content/articles/latest': latestArticlesPath,
	'/v1/content/articles/resolve': resolveArticlePath,
	'/v1/notification-tests': notificationTestsPath,
	'/v1/notifications': notificationsPath,
	'/v1/notifications/article': notificationArticleHistoryPath,
	'/v1/notifications/senders': notificationSendersPath,
	'/v1/notifications/{id}': notificationByIdPath,
	'/v1/preview/email': emailPreviewPath,
	'/v1/user': userPath,
} as const;
