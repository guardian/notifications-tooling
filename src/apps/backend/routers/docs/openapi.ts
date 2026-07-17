import { z } from 'zod';
import { notificationPushRequestSchema } from '../notifications/schemas/notification-push-request';

const notificationPushRequestJsonSchema = z.toJSONSchema(
	notificationPushRequestSchema,
	{ target: 'openapi-3.0', io: 'input' },
);

/**
 * The OpenAPI 3.0 document served by Swagger UI at `/docs/api`.
 *
 * The `POST /v1/notifications` request body is derived directly from the Zod
 * validation schema so the docs stay in sync with what the API actually
 * accepts.
 */
export const openApiDocument = {
	openapi: '3.0.3',
	info: {
		title: 'Notifications Tooling API',
		version: '1.0.0',
		description:
			'Broker API for validating and enqueuing Guardian notifications across channels.',
	},
	paths: {
		'/health': {
			get: {
				summary: 'Health check',
				responses: {
					'200': {
						description: 'The service is healthy.',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: { type: 'string', example: 'ok' },
										uptime: { type: 'number', example: 123.45 },
									},
								},
							},
						},
					},
				},
			},
		},
		'/v1/notifications': {
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
					'201': { description: 'The notification was accepted.' },
					'400': { description: 'The request body is structurally invalid.' },
				},
			},
		},
	},
} as const;
