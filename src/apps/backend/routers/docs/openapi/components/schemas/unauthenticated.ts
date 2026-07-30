/**
 * The `401 Unauthorized` response body returned by `authMiddleware` when a
 * request lacks a valid pan-domain cookie. Shares the `{ error, message }`
 * envelope used across the API, plus an actionable `loginUrl`. Referenced via
 * `#/components/schemas/Unauthenticated`.
 */
export const unauthenticatedSchema = {
	type: 'object',
	required: ['error', 'message', 'loginUrl'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['unauthenticated'],
		},
		message: {
			type: 'string',
			description: 'Human-readable summary of the failure.',
			example: 'Authentication is required to access this resource.',
		},
		loginUrl: {
			type: 'string',
			format: 'uri',
			description:
				'The pan-domain login URL to redirect the user to, carrying a `returnUrl` back to the originally requested resource.',
			example:
				'https://login.gutools.co.uk/login?returnUrl=https%3A%2F%2Fdispatch.gutools.co.uk%2Fv1%2Fuser',
		},
	},
} as const;
