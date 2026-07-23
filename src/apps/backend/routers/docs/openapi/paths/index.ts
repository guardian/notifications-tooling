import { channelsAudiencesPath, channelsConstraintsPath } from './channels';
import { healthPath } from './health';
import { notificationsPath } from './notifications';

/** The `paths` block of the OpenAPI document, keyed by route. */
export const paths = {
	'/health': healthPath,
	'/v1/channels/constraints': channelsConstraintsPath,
	'/v1/channels/audiences': channelsAudiencesPath,
	'/v1/notifications': notificationsPath,
} as const;
