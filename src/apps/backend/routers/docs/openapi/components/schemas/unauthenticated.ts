/**
 * The `401 Unauthorized` response body returned by `authMiddleware` when a
 * request lacks a valid pan-domain cookie. Shares the
 * `{ error, message, requestId }` envelope used across the API, plus an
 * actionable `loginUrl`. Referenced via `#/components/schemas/Unauthenticated`.
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
		requestId: {
			type: 'string',
			description: 'Correlates this failure with the backend log record of it.',
		},
		loginUrl: {
			type: 'string',
			format: 'uri',
			description:
				'The pan-domain login URL to redirect the user to. It deliberately carries no `returnUrl`: this response is consumed by the SPA, and only the browser knows which page the user is on, so the client appends its own. See docs/ADRs/login-redirect-ownership.md.',
			example: 'https://login.gutools.co.uk/login',
		},
	},
} as const;
