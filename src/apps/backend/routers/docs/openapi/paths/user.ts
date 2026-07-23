/** The `/v1/user` path item. */
export const userPath = {
	get: {
		summary: 'Retrieve the authenticated user',
		description:
			'Returns the authenticated user (under `user`) and their permissions. Currently a mock returning a sample user and permissions until pan-domain-node verification and the permissions store are integrated.',
		responses: {
			'200': {
				description: 'The authenticated user and their permissions.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UserResponse' },
					},
				},
			},
		},
	},
} as const;
