/** The request body and response payloads used by the Grafana datasource. */
export const grafanaQueryRequestSchema = {
	type: 'object',
	required: ['range', 'targets'],
	properties: {
		range: {
			type: 'object',
			required: ['from', 'to'],
			properties: {
				from: { type: 'string', format: 'date-time' },
				to: { type: 'string', format: 'date-time' },
			},
		},
		targets: {
			type: 'array',
			minItems: 1,
			maxItems: 1,
			items: {
				type: 'object',
				required: ['target'],
				properties: {
					target: {
						type: 'string',
						enum: ['notifications'],
						example: 'notifications',
					},
					refId: { type: 'string', example: 'A' },
				},
			},
		},
	},
} as const;

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
	},
} as const;
