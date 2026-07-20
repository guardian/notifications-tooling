/**
 * The error envelope returned for a rejected `POST /v1/notifications` request,
 * used by both `400` (structural) and `422` (semantic) responses.
 */
export const notificationValidationErrorSchema = {
	type: 'object',
	required: ['error', 'message', 'details'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['bad_request', 'validation_failed'],
		},
		message: {
			type: 'string',
			description: 'Human-readable summary of the failure.',
		},
		requestId: {
			type: 'string',
			description: 'Correlation id echoed back for tracing.',
		},
		details: {
			type: 'array',
			description: 'The individual validation issues that caused the failure.',
			items: {
				type: 'object',
				required: ['code', 'path', 'message'],
				properties: {
					code: {
						type: 'string',
						description: 'The Zod issue code.',
						example: 'too_big',
					},
					path: {
						type: 'string',
						description: 'RFC 6901 JSON Pointer to the offending field.',
						example: '/content/items/lead/title',
					},
					message: { type: 'string' },
				},
			},
		},
	},
} as const;
