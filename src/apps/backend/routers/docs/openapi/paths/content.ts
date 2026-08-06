/** The `/v1/content/articles/resolve` path item. */
export const resolveArticlePath = {
	post: {
		summary: 'Resolve a Guardian article link or id',
		description:
			'Determines the CAPI content id from the input — a bare article id or any Guardian article URL (public front-end or internal gutools preview/viewer link) — and resolves it against the Content API. Returns only the requested CAPI `show-fields`, under `article`.',
		security: [{ pandaCookie: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/ResolveArticleRequest' },
				},
			},
		},
		responses: {
			'200': {
				description:
					'The article was found. Returns the requested CAPI `show-fields` under `article`.',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['article'],
							properties: {
								article: { $ref: '#/components/schemas/ResolvedArticle' },
							},
						},
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
					'The body failed semantic validation, or the article reference is not a Guardian article URL or id (`invalid_article_reference`).',
				content: {
					'application/json': {
						schema: {
							oneOf: [
								{ $ref: '#/components/schemas/NotificationValidationError' },
								{ $ref: '#/components/schemas/ArticleResolutionError' },
							],
						},
					},
				},
			},
			'404': {
				description:
					'No Guardian article was found for the reference (`article_not_found`).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ArticleResolutionError' },
					},
				},
			},
			'502': {
				description:
					'The Content API could not be reached or returned an invalid response (`capi_unavailable`).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ArticleResolutionError' },
					},
				},
			},
		},
	},
} as const;
