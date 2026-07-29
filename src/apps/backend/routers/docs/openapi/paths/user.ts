/** The `/v1/user` path item. */
export const userPath = {
	get: {
		summary: 'Retrieve the authenticated user',
		description:
			'Returns the authenticated user (under `user`), decoded from the pan-domain cookie, and their permissions resolved from the Guardian permissions store.',
		security: [{ pandaCookie: [] }],
		responses: {
			'200': {
				description: 'The authenticated user and their permissions.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/UserResponse' },
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
		},
	},
} as const;
