/**
 * Reusable `securitySchemes` referenced from an operation's `security`
 * requirement. `pandaCookie` models the Guardian pan-domain authentication
 * cookie that `authMiddleware` verifies before a protected handler runs.
 */
export const securitySchemes = {
	pandaCookie: {
		type: 'apiKey',
		in: 'cookie',
		name: 'gutoolsAuth-assym',
		description:
			'Guardian pan-domain authentication cookie. Verified by `authMiddleware`; requests without a valid cookie receive a `401` carrying the login URL.',
	},
} as const;
