import { z } from 'zod';
import { notificationPushRequestSchema } from '../../../notifications/schemas/notification-push-request';

const notificationPushRequestJsonSchema = z.toJSONSchema(
	notificationPushRequestSchema,
	{ target: 'openapi-3.0', io: 'input' },
);

/**
 * The `/v1/notifications` path item.
 *
 * The `POST` request body is derived directly from the Zod validation schema so
 * the docs stay in sync with what the API actually accepts.
 */
export const notificationsPath = {
	get: {
		summary: 'List enqueued notifications',
		responses: {
			'200': { description: 'A list of enqueued notifications.' },
		},
	},
	post: {
		summary: 'Validate and enqueue a notification',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: notificationPushRequestJsonSchema,
				},
			},
		},
		responses: {
			'202': {
				description:
					'The notification passed validation and was enqueued for per-channel dispatch.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/AcceptedNotification' },
					},
				},
			},
			'400': {
				description:
					'The request body is structurally malformed (missing/mistyped fields, unknown channel, or unexpected keys).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ValidationError' },
					},
				},
			},
			'422': {
				description:
					'The request body is well-formed but failed semantic validation (content length limits, unknown references, or cross-field rules).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ValidationError' },
					},
				},
			},
		},
	},
} as const;
