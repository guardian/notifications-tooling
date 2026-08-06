/**
 * The error envelope returned by `POST /v1/content/articles/resolve` for the
 * resolution-specific failures: an unresolvable reference
 * (`invalid_article_reference`), a missing article (`article_not_found`), or an
 * unreachable Content API (`capi_unavailable`).
 */
export const articleResolutionErrorSchema = {
	type: 'object',
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: [
				'invalid_article_reference',
				'article_not_found',
				'capi_unavailable',
			],
		},
		message: {
			type: 'string',
			description: 'A safe, human-readable explanation of the failure.',
		},
		requestId: {
			type: 'string',
			description: 'Correlation id echoed back for tracing.',
		},
	},
} as const;
