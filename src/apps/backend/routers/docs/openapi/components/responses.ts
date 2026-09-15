/**
 * Reusable `responses` referenced via `#/components/responses/*`.
 * `Unauthenticated` is the shared `401` returned by every endpoint behind
 * `authMiddleware`; `InsufficientPermissions` is the shared `403` returned by
 * every endpoint behind `requirePermissions`.
 */
export const responses = {
	Unauthenticated: {
		description:
			'The request lacks a valid pan-domain authentication cookie. The body carries the login URL to redirect the user to.',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/Unauthenticated' },
			},
		},
	},
	InsufficientPermissions: {
		description:
			'The authenticated user is missing one or more permissions required to access this resource.',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/InsufficientPermissions' },
			},
		},
	},
	NotificationNotFound: {
		description: 'No notification exists with the given id.',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/NotificationNotFound' },
			},
		},
	},
	IdempotencyKeyConflict: {
		description:
			'The idempotencyKey has already been used by an earlier request.',
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/NotificationConflictError' },
			},
		},
	},
} as const;
