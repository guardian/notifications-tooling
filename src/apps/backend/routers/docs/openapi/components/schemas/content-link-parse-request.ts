/**
 * The `POST /v1/content/link/resolve` request body: a Guardian article URL and
 * the CAPI `show-fields` to return for it.
 */
export const contentLinkParseRequestSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['link', 'fields'],
	properties: {
		link: {
			type: 'object',
			additionalProperties: false,
			required: ['url'],
			properties: {
				url: {
					type: 'string',
					description:
						'A Guardian article URL to resolve against the Content API.',
					example:
						'https://www.theguardian.com/environment/2026/jul/19/a-headline',
				},
			},
		},
		fields: {
			type: 'array',
			items: { type: 'string' },
			description: 'CAPI show-fields to include in the resolved article.',
			example: ['headline', 'thumbnail', 'trailText'],
		},
	},
} as const;
