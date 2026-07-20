/** The `/health` path item. */
export const healthPath = {
	get: {
		summary: 'Health check',
		responses: {
			'200': {
				description: 'The service is healthy.',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								status: { type: 'string', example: 'ok' },
								uptime: { type: 'number', example: 123.45 },
							},
						},
					},
				},
			},
		},
	},
} as const;
