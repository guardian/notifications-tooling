import z from 'zod';

/**
 * Body for `POST /v1/preview/email`: an article reference — any Guardian article URL.
 */
export const emailPreviewRequestSchema = z.strictObject({
	article: z.string().trim().min(1).meta({
		description:
			'The article to resolve, as either a bare CAPI content id (e.g. `environment/2026/jul/19/a-headline`) or any Guardian article URL: a public front-end link (`www.`/`amp.`/`m.theguardian.com`, `gu.com`) or an internal gutools preview/viewer link. The id is taken from the URL path, so the host, query string and fragment are ignored.',
		example: 'https://www.theguardian.com/environment/2026/jul/19/a-headline',
	}),
	audience: z.string().array(),
});

export type EmailPreviewRequest = z.infer<typeof emailPreviewRequestSchema>;

/**
 * The response Body from `POST /v1/preview/email`.
 */
export const emailPreviewResponseSchema = z.strictObject({
	articleId: z.string().trim().min(1).meta({
		description:
			'The CAPI content id of the article rendered (e.g. `environment/2026/jul/19/a-headline`)',
		example: 'environment/2026/jul/19/a-headline',
	}),
	html: z.string().min(1).meta({
		description: 'The HTML for a notification email',
	}),
	newsletterId: z.string().trim().min(1).meta({
		description: 'The id of the newsletter series used for the preview',
		example: 'breaking-news-us',
	}),
});

export type EmailPreviewResponse = z.infer<typeof emailPreviewResponseSchema>;
