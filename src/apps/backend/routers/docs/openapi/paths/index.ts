import { channelsAudiencesPath, channelsConstraintsPath } from './channels';
import { healthPath } from './health';
import { notificationTestsPath } from './notification-tests';
import { notificationsPath } from './notifications';
import { userPath } from './user';

/** The `paths` block of the OpenAPI document, keyed by route. */
export const paths = {
	'/health': healthPath,
	'/v1/channels/constraints': channelsConstraintsPath,
	'/v1/channels/audiences': channelsAudiencesPath,
	'/v1/notification-tests': notificationTestsPath,
	'/v1/notifications': notificationsPath,
	'/v1/user': userPath,
} as const;
