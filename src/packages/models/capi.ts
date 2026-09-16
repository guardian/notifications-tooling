import z from 'zod';

/**
 * Body for `POST /v1/content/articles/resolve`: an article reference — a bare
 * article id or any Guardian article URL.
 */
export const resolveArticleRequestSchema = z.strictObject({
	article: z.string().trim().min(1).meta({
		description:
			'The article to resolve, as either a bare CAPI content id (e.g. `environment/2026/jul/19/a-headline`) or any Guardian article URL: a public front-end link (`www.`/`amp.`/`m.theguardian.com`, `gu.com`) or an internal gutools preview/viewer link. A `#block-...` fragment on a liveblog URL selects that block.',
		example: 'https://www.theguardian.com/environment/2026/jul/19/a-headline',
	}),
});

export type ResolveArticleRequest = z.infer<typeof resolveArticleRequestSchema>;

export type CapiFailureReason =
	'not_found' | 'unavailable' | 'invalid_response';

/** A classified failure talking to the Content API. */
export class CapiError extends Error {
	constructor(
		readonly reason: CapiFailureReason,
		options?: ErrorOptions,
	) {
		const message = (() => {
			switch (reason) {
				case 'not_found':
					return 'The article could not be found.';
				case 'unavailable':
					return 'The Content API could not be reached.';
				case 'invalid_response':
					return 'The Content API returned an unexpected response.';
			}
		})();

		super(message, options);
		this.name = 'CapiError';
	}
}

/**
 * A single CAPI content item.
 *
 * Only a subset of fields are asserted; other fields the JSON API can return
 * (`tags`, `section`, `blocks`  etc) are preserved and passed through verbatim.
 *
 * `fields` is optional to reflect the CAPI model, but in practise, it will be present
 *  if the request to CAPI specified the "show-fields" search param.
 *
 * see https://open-platform.theguardian.com/documentation/item for the model
 */
export const capiBlockSchema = z.looseObject({
	id: z.string().optional(),
	elements: z
		.array(
			z.looseObject({
				type: z.string(),
				assets: z
					.array(
						z.looseObject({
							file: z.string().optional(),
							typeData: z
								.looseObject({
									width: z.number().optional(),
								})
								.optional(),
						}),
					)
					.optional(),
				imageTypeData: z
					.looseObject({
						alt: z.string().optional(),
					})
					.optional(),
			}),
		)
		.optional(),
});
export type CapiBlock = z.infer<typeof capiBlockSchema>;

const capiContentSchema = z.looseObject({
	id: z.string(),
	type: z.string(),
	sectionName: z.string().optional(),
	pillarId: z.string().optional(),
	pillarName: z.string().optional(),
	webTitle: z.string(),
	webUrl: z.string(),
	webPublicationDate: z.string().optional(),
	fields: z.record(z.string(), z.string()).optional(),
	blocks: z
		.looseObject({
			main: capiBlockSchema.optional(),
			body: z.array(capiBlockSchema).optional(),
		})
		.optional(),
});

/** The full CAPI content item for the resolved article. */
export type ResolvedArticle = z.infer<typeof capiContentSchema>;

export const capiResponseSchema = z.object({
	response: z.object({
		status: z.string(),
		content: capiContentSchema,
	}),
});
export type CapiResponse = z.infer<typeof capiResponseSchema>;

const capiSearchResultSchema = z.looseObject({
	id: z.string(),
	sectionName: z.string().optional(),
	webPublicationDate: z.iso.datetime().optional(),
	webTitle: z.string(),
	webUrl: z.url(),
	fields: z
		.object({
			headline: z.string().optional(),
			productionOffice: z.enum(['UK', 'US', 'AUS']).optional(),
			thumbnail: z.url().optional(),
		})
		.optional(),
	tags: z
		.array(
			z.looseObject({
				id: z.string(),
			}),
		)
		.default([]),
});

export const capiSearchResponseSchema = z.object({
	response: z.object({
		status: z.literal('ok'),
		pageSize: z.number().int().positive(),
		results: z.array(capiSearchResultSchema),
	}),
});
export type CapiSearchResponse = z.infer<typeof capiSearchResponseSchema>;

export const productionOfficeSchema = z.enum(['uk', 'us', 'au']);
export type ProductionOffice = z.infer<typeof productionOfficeSchema>;

export const audienceRegionSchema = z.enum(['uk', 'us', 'au', 'global']);
export type AudienceRegion = z.infer<typeof audienceRegionSchema>;
export const intendedAudienceSchema = z.array(audienceRegionSchema);
export type IntendedAudience = z.infer<typeof intendedAudienceSchema>;

export const latestArticleSchema = z.object({
	webUrl: z.url(),
	publishedAt: z.iso.datetime(),
	headline: z.string(),
	section: z.string(),
	thumbnail: z.url().optional(),
	productionOffice: productionOfficeSchema.optional(),
	intendedAudience: intendedAudienceSchema,
});
export type LatestArticle = z.infer<typeof latestArticleSchema>;

export const latestArticlesResponseSchema = z.object({
	articles: z.array(latestArticleSchema),
});
export type LatestArticlesResponse = z.infer<
	typeof latestArticlesResponseSchema
>;

export const resolveArticleResponseSchema = z.object({
	article: capiContentSchema,
	requestedUrl: z.string().optional(),
	requestedBlock: capiBlockSchema.optional(),
});
export type ResolveArticleResponse = z.infer<
	typeof resolveArticleResponseSchema
>;
