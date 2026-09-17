/** The Grafana JSON datasource endpoints. */
export const grafanaMetricsPath = {
	post: {
		summary: 'List Grafana metrics',
		security: [{ pandaCookie: [] }],
		responses: {
			'200': {
				description: 'The metrics available to Grafana Builder mode.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GrafanaMetrics' },
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
		},
	},
} as const;

export const grafanaQueryPath = {
	post: {
		summary: 'Query notification data for Grafana',
		security: [{ pandaCookie: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/GrafanaQueryRequest' },
				},
			},
		},
		responses: {
			'200': {
				description: 'Notification data in Grafana table format.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GrafanaQueryResponse' },
					},
				},
			},
			'400': {
				description: 'The Grafana query does not contain a valid date range.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/GrafanaQueryError' },
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
		},
	},
} as const;
