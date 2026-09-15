/**
 * The `404 Not Found` response body returned by `GET /v1/notifications/{id}`
 * when no notification exists with the given id. Shares the
 * `{ error, message, requestId }` envelope used across the API. Referenced via
 * `#/components/schemas/NotificationNotFound`.
 */
export const notificationNotFoundSchema = {
	type: 'object',
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['not_found'],
		},
		message: {
			type: 'string',
			description: 'Human-readable summary of the failure.',
			example: 'No notification exists with the given id.',
		},
		requestId: {
			type: 'string',
			description: 'Correlates this failure with the backend log record.',
		},
	},
} as const;
