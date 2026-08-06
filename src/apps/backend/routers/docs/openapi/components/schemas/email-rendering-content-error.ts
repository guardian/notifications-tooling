export const emailRenderingContentErrorSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			enum: ['email_rendering_failed'],
		},
		message: {
			type: 'string',
			description:
				'A safe explanation of why the content could not be rendered.',
		},
	},
} as const;
