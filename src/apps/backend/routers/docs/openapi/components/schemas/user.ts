/**
 * The `200 OK` response body returned by `GET /v1/user`, mirroring the
 * pan-domain-node `User` interface. Referenced via `#/components/schemas/User`.
 */
export const userSchema = {
	type: 'object',
	required: [
		'firstName',
		'lastName',
		'email',
		'authenticatingSystem',
		'authenticatedIn',
		'expires',
		'multifactor',
	],
	properties: {
		firstName: { type: 'string', example: 'Ada' },
		lastName: { type: 'string', example: 'Lovelace' },
		email: {
			type: 'string',
			format: 'email',
			example: 'ada.lovelace@guardian.co.uk',
		},
		avatarUrl: {
			type: 'string',
			format: 'uri',
			description: 'Optional profile picture URL.',
			example: 'https://avatars.example.com/ada-lovelace.png',
		},
		authenticatingSystem: {
			type: 'string',
			description: 'The app that issued the login.',
			example: 'notifications-tooling',
		},
		authenticatedIn: {
			type: 'array',
			items: { type: 'string' },
			description: 'The apps the user has been validated in.',
			example: ['notifications-tooling'],
		},
		expires: {
			type: 'number',
			description: 'Cookie expiry as epoch milliseconds.',
			example: 1753272000000,
		},
		multifactor: {
			type: 'boolean',
			description:
				'Whether the login was made with multi-factor authentication.',
			example: true,
		},
	},
} as const;

/**
 * The `200 OK` response body returned by `GET /v1/user`: the authenticated user
 * and the names of the permissions granted to them. Referenced via
 * `#/components/schemas/UserResponse`.
 */
export const userResponseSchema = {
	type: 'object',
	required: ['user', 'permissions'],
	properties: {
		user: { $ref: '#/components/schemas/User' },
		permissions: {
			type: 'array',
			description: 'Names of the permissions currently granted to the user.',
			items: { type: 'string', example: 'DispatchAccess' },
		},
	},
} as const;
