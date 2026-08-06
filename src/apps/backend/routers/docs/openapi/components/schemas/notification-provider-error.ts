export const notificationProviderErrorSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable provider failure code.',
			enum: ['email_rendering_failed', 'braze_request_failed'],
		},
		message: {
			type: 'string',
			description: 'A safe explanation of the upstream service failure.',
		},
	},
} as const;
