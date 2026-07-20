import { z } from 'zod';
import { notificationPushRequestSchema } from '../../../../notifications/schemas/notification-push-request';

/**
 * The `POST /v1/notifications` request body, derived directly from the Zod
 * validation schema so the docs stay in sync with what the API actually
 * accepts. Registered as a named component and referenced via
 * `#/components/schemas/NotificationPushRequest`.
 */
export const notificationPushRequestJsonSchema = z.toJSONSchema(
	notificationPushRequestSchema,
	{ target: 'openapi-3.0', io: 'input' },
);
