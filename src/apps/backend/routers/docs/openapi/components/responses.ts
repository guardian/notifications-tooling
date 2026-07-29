/**
 * Reusable `responses` referenced via `#/components/responses/*`. `Unauthenticated`
 * is the shared `401` returned by every endpoint behind `authMiddleware`.
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
} as const;
