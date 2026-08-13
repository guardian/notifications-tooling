/** The `/v1/preview/email` path item. */
export const emailPreviewPath = {
	post: {
		summary:
			'Provide the HTML for the notification email of a Guardian article',
		description:
			'Determines the CAPI content id and audience segment from the input and requests the HTML from the email-rendering service. Returns the HTML, articleId and newsletter Id.',
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
					'The email html was rendered. Returns the HTML, articleId and newsletter Id.',
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
							$ref: '#/components/schemas/EmailPreviewErrorSchema',
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
							$ref: '#/components/schemas/EmailPreviewErrorSchema',
						},
						example: {
							error: 'invalid_article_reference',
							message:
								'The article must be a Guardian article URL or content id.',
							requestId: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
						},
					},
				},
			},
			'404': {
				description: 'The requested resource could not be found.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/EmailRenderingContentError' },
						example: {
							error: 'article_not_found',
							message: 'No Guardian article was found for that link.',
							requestId: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
						},
					},
				},
			},
			'502': {
				description: 'The Email Rendering API (`email_rendering_unavailable`).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/EmailRenderingContentError' },
						example: {
							error: 'email_rendering_unavailable',
							message:
								'The Email Rendering API could not be reached. Please try again.',
							requestId: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
						},
					},
				},
			},
		},
	},
} as const;
