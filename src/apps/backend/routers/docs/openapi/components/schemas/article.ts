/**
 * The `POST /v1/content/link/resolve` success body (under `article`): only the
 * CAPI show-fields that were requested, as a name/value map.
 */
export const articleSchema = {
	type: 'object',
	additionalProperties: { type: 'string' },
	description: 'The requested CAPI show-fields for the resolved article.',
	example: {
		headline: 'A rhyme to recall rising temperatures',
		thumbnail: 'https://media.guim.co.uk/abc/500.jpg',
	},
} as const;
