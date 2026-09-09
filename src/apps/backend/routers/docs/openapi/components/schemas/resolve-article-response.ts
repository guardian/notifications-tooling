export const resolveArticleResponseSchema = {
	type: 'object',
	required: ['article'],
	properties: {
		article: { $ref: '#/components/schemas/ResolvedArticle' },
		requestedUrl: {
			type: 'string',
			format: 'uri',
			description:
				'The exact submitted liveblog URL when it contains a validated block fragment.',
			example:
				'https://www.theguardian.com/world/live/2026/sep/04/latest-developments?filterKeyEvents=false#block-6a9af4938f0834a1091dfae4',
		},
		requestedBlock: {
			$ref: '#/components/schemas/LiveblogBlock',
			description:
				'The validated block selected by the URL fragment, or the main block when an unfragmented liveblog URL is resolved.',
		},
	},
} as const;
