export const liveblogBlockSchema = {
	type: 'object',
	additionalProperties: true,
	properties: {
		id: {
			type: 'string',
			description: 'The CAPI liveblog block id.',
			example: 'block-6a9af4938f0834a1091dfae4',
		},
		elements: {
			type: 'array',
			description: 'The content elements belonging to the liveblog block.',
			items: { type: 'object', additionalProperties: true },
		},
	},
} as const;
