/** The error envelope returned when the Content API request cannot be fulfilled. */
export const capiUnavailableErrorSchema = {
	type: 'object',
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['capi_unavailable'],
		},
		message: {
			type: 'string',
			description: 'A safe, human-readable explanation of the failure.',
		},
		requestId: {
			type: 'string',
			description: 'Correlation id echoed back for tracing.',
		},
	},
} as const;
