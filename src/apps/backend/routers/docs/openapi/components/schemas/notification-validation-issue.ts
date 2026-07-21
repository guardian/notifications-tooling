/**
 * A single validation issue within a rejected `POST /v1/notifications`
 * response. Reused by every entry of `NotificationValidationError.details`.
 * Referenced via `#/components/schemas/NotificationValidationIssue`.
 */
export const notificationValidationIssueSchema = {
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
} as const;
