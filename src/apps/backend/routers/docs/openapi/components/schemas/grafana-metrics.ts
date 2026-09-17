/** The metric definitions returned to the SimPod Grafana datasource. */
export const grafanaMetricsSchema = {
	type: 'array',
	items: {
		type: 'object',
		required: ['label', 'value'],
		properties: {
			label: { type: 'string', example: 'Notifications' },
			value: { type: 'string', example: 'notifications' },
		},
	},
} as const;
