/**
 * The `200 OK` response body returned by `GET /health`. Referenced via
 * `#/components/schemas/HealthStatus`.
 */
export const healthStatusSchema = {
	type: 'object',
	required: ['status', 'uptime'],
	properties: {
		status: { type: 'string', example: 'ok' },
		uptime: {
			type: 'number',
			description: 'Process uptime in seconds.',
			example: 123.45,
		},
	},
} as const;
