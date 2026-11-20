/**
 * The `415 Unsupported Media Type` response body returned by the
 * state-changing send endpoints when the request body is not
 * `application/json`. Shares the `{ error, message, requestId }` envelope used
 * across the API. Referenced via `#/components/schemas/UnsupportedMediaType`.
 */
export const unsupportedMediaTypeSchema = {
	type: 'object',
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['unsupported_media_type'],
		},
		message: {
			type: 'string',
			description: 'Human-readable summary of the failure.',
			example: 'The request body must be sent as application/json.',
		},
		requestId: {
			type: 'string',
			description: 'Correlates this failure with the backend log record.',
		},
	},
} as const;
