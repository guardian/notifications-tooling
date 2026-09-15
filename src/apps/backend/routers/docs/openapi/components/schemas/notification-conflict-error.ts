/**
 * The `409 Conflict` response body returned by `POST /v1/notifications` and
 * `POST /v1/notification-tests` when the `idempotencyKey` has already been
 * used. Shares the `{ error, message, requestId }` envelope used across the
 * API. Referenced via `#/components/schemas/NotificationConflictError`.
 */
export const notificationConflictErrorSchema = {
	type: 'object',
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['idempotency_key_conflict'],
		},
		message: {
			type: 'string',
			description: 'Human-readable summary of the conflict.',
			example:
				"idempotencyKey 'morning-briefing-2026-07-08' has already been used.",
		},
		requestId: {
			type: 'string',
			description: 'Correlates this failure with the backend log record.',
		},
	},
} as const;
