import {
	channelsAudiencesPath,
	channelsConstraintsPath,
	emailConfigPath,
} from './channels';
import { resolveArticlePath } from './content';
import { healthPath } from './health';
import { notificationTestsPath } from './notification-tests';
import { notificationByIdPath, notificationsPath } from './notifications';
import { emailPreviewPath } from './preview';
import { userPath } from './user';

/** The `paths` block of the OpenAPI document, keyed by route. */
export const paths = {
	'/health': healthPath,
	'/v1/channels/constraints': channelsConstraintsPath,
	'/v1/channels/audiences': channelsAudiencesPath,
	'/v1/channels/config/email': emailConfigPath,
	'/v1/content/articles/resolve': resolveArticlePath,
	'/v1/notification-tests': notificationTestsPath,
	'/v1/notifications': notificationsPath,
	'/v1/notifications/{id}': notificationByIdPath,
	'/v1/preview/email': emailPreviewPath,
	'/v1/user': userPath,
} as const;
