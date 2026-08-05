/** The `POST /v1/content/link/parse` request body: a single Guardian article URL. */
export const contentLinkParseRequestSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['link'],
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
	},
} as const;
