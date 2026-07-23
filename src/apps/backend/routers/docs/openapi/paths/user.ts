/** The `/v1/user` path item. */
export const userPath = {
	get: {
		summary: 'Retrieve the authenticated user',
		description:
			'Returns the authenticated user, as resolved from the pan-domain (Panda) cookie. Currently a mock returning a sample user until pan-domain-node verification is integrated.',
		responses: {
			'200': {
				description: 'The authenticated user.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/User' },
					},
				},
			},
		},
	},
} as const;
