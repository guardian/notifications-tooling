export const brazePushRecipientErrorSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			enum: ['braze_push_recipient_not_found'],
		},
		message: {
			type: 'string',
			description:
				'A safe explanation that no push-capable Braze profile matched a recipient.',
		},
	},
} as const;
