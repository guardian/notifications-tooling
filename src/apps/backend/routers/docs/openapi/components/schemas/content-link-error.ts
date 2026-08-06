/**
 * The error envelope returned by `POST /v1/content/link/resolve` for the
 * content-specific failures: an unparseable link (`invalid_url`), a missing
 * article (`article_not_found`), or an unreachable Content API
 * (`capi_unavailable`).
 */
export const contentLinkErrorSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['error', 'message'],
	properties: {
		error: {
			type: 'string',
			description: 'Machine-readable error code.',
			enum: ['invalid_url', 'article_not_found', 'capi_unavailable'],
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
