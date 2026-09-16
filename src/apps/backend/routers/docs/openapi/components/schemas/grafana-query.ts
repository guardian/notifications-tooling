/** The response and error payloads used by the Grafana datasource. */
export const grafanaQueryResponseSchema = {
	type: 'array',
	items: {
		type: 'object',
		required: ['type', 'columns', 'rows'],
		properties: {
			type: { type: 'string', enum: ['table'] },
			columns: { type: 'array', items: { type: 'object' } },
			rows: { type: 'array', items: { type: 'array' } },
		},
	},
} as const;

export const grafanaQueryErrorSchema = {
	type: 'object',
	required: ['error', 'message'],
	properties: {
		error: { type: 'string', example: 'invalid_query' },
		message: { type: 'string' },
		requestId: {
			type: 'string',
			description: 'Correlates this failure with the backend log record.',
		},
	},
} as const;
