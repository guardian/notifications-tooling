/** The `/v1/content/link/parse` path item. */
export const contentLinkParsePath = {
	post: {
		summary: 'Resolve a Guardian article link',
		description:
			'Parses the article id from a Guardian article URL and resolves it against the Content API, returning the summary fields (category, publication date, thumbnail) the SPA uses to preview the link.',
		security: [{ pandaCookie: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/ContentLinkParseRequest' },
				},
			},
		},
		responses: {
			'200': {
				description: 'The article was found. Returns its summary fields.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ArticleSummary' },
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
			'400': {
				description:
					'The request body is structurally malformed (missing/mistyped fields or unexpected keys).',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationValidationError',
						},
					},
				},
			},
			'422': {
				description:
					'The body failed semantic validation, or the link is not a Guardian article URL (`invalid_url`).',
				content: {
					'application/json': {
						schema: {
							oneOf: [
								{ $ref: '#/components/schemas/NotificationValidationError' },
								{ $ref: '#/components/schemas/ContentLinkError' },
							],
						},
					},
				},
			},
			'404': {
				description:
					'No Guardian article was found for the link (`article_not_found`).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ContentLinkError' },
					},
				},
			},
			'502': {
				description:
					'The Content API could not be reached or returned an invalid response (`capi_unavailable`).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ContentLinkError' },
					},
				},
			},
		},
	},
} as const;
