/**
 * The `403 Forbidden` response body returned by `requirePermissions` when the
 * authenticated user is missing one or more required permissions. Shares the
 * `{ error, message, requestId }` envelope used across the API (mirroring the
 * `401` `Unauthenticated` body, minus the redirect-only `loginUrl`). Referenced
 * via `#/components/schemas/InsufficientPermissions`.
 */
export const insufficientPermissionsSchema = {
	type: 'object',
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['insufficient_permissions'],
		},
		message: {
			type: 'string',
			description: 'Human-readable summary of the failure.',
			example: 'You do not have permission to access this resource.',
		},
		requestId: {
			type: 'string',
			description: 'Correlates this failure with the backend log record.',
		},
	},
} as const;
