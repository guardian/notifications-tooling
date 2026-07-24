import { z } from 'zod';
import { notificationSendRequestSchema } from '../../../../notifications/schemas/notification-send-request';

/**
 * The `POST /v1/notifications` request body, derived directly from the Zod
 * validation schema so the docs stay in sync with what the API actually
 * accepts. Registered as a named component and referenced via
 * `#/components/schemas/NotificationSendRequest`.
 */
export const notificationSendRequestJsonSchema = z.toJSONSchema(
	notificationSendRequestSchema,
	{ target: 'openapi-3.0', io: 'input' },
);
