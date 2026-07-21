/** The `/health` path item. */
export const healthPath = {
	get: {
		summary: 'Health check',
		responses: {
			'200': {
				description: 'The service is healthy.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/HealthStatus' },
					},
				},
			},
		},
	},
} as const;
