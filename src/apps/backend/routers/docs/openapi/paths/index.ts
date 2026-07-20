import { healthPath } from './health';
import { notificationsPath } from './notifications';

/** The `paths` block of the OpenAPI document, keyed by route. */
export const paths = {
	'/health': healthPath,
	'/v1/notifications': notificationsPath,
} as const;
