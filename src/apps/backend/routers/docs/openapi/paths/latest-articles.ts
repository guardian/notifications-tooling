/** The `/v1/content/articles/latest` path item. */
export const latestArticlesPath = {
	get: {
		summary: 'List the latest published Guardian articles and liveblogs',
		description:
			'Returns articles and liveblogs published in the previous 24 hours, sorted by publication date with the newest first. Production office and intended audience regions are derived from CAPI fields and tracking tags.',
		security: [{ pandaCookie: [] }],
		responses: {
			'200': {
				description: 'The latest published articles and liveblogs.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/LatestArticlesResponse' },
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
			'502': {
				description:
					'The Content API could not be reached or returned an invalid response (`capi_unavailable`).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/CapiUnavailableError' },
						example: {
							error: 'capi_unavailable',
							message:
								'The Content API could not be reached. Please try again.',
							requestId: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
						},
					},
				},
			},
		},
	},
} as const;
