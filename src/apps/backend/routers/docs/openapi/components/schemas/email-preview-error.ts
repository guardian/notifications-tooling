/**
 * The error envelope returned for a rejected `POST /v1/notifications` request,
 * used by both `400` (structural) and `422` (semantic) responses.
 */
export const emailPreviewErrorSchema = {
	type: 'object',
	required: ['error', 'message', 'details'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: [
				'bad_request',
				'validation_failed',
				'invalid_audience',
				'invalid_article_reference',
			],
		},
		message: {
			type: 'string',
			description: 'Human-readable summary of the failure.',
		},
		requestId: {
			type: 'string',
			description: 'Correlation id echoed back for tracing.',
		},
	},
} as const;
