import { UserPermissions } from '@config';
import { getSSMParameter } from '@config/ssm';
import { CapiError, fetchArticle, type ResolvedArticle } from '@services';
import { determineArticleId } from '@utils';
import { type Request, type Response, Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { buildErrorEnvelope } from '../../error-envelope';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import { handleValidationErrors } from '../notifications';

/** CAPI is given a fixed request timeout; it is not configurable per stage. */
const CAPI_REQUEST_TIMEOUT_MS = 10_000;

/**
 * Body for `POST /v1/content/articles/resolve`: an article reference (a bare
 * article id or any Guardian article URL) and the CAPI `show-fields` to return.
 */
export const resolveArticleRequestSchema = z.strictObject({
	article: z.string().trim().min(1).meta({
		description:
			'The article to resolve, as either a bare CAPI content id (e.g. `environment/2026/jul/19/a-headline`) or any Guardian article URL: a public front-end link (`www.`/`amp.`/`m.theguardian.com`, `gu.com`) or an internal gutools preview/viewer link. The id is taken from the URL path, so the host, query string and fragment are ignored.',
		example: 'https://www.theguardian.com/environment/2026/jul/19/a-headline',
	}),
	showFields: z
		.array(
			z
				.string()
				.trim()
				.min(1)
				.regex(/^[a-zA-Z]+$/),
		)
		.meta({
			description:
				'CAPI `show-fields` names to return for the article (letters only, e.g. `headline`, `standfirst`, `thumbnail`, `trailText`). Only the requested fields are returned, under `article.fields`.',
			example: ['headline', 'thumbnail', 'trailText'],
		}),
});

type ResolveArticle = (
	articleId: string,
	showFields: string[],
) => Promise<ResolvedArticle>;

/**
 * Default resolver: reads the CAPI endpoint and key from SSM, then looks the
 * article up. Injectable so handler tests can drive the outcomes without a
 * network call or credentials.
 */
const resolveArticleFromCapi: ResolveArticle = async (
	articleId,
	showFields,
) => {
	const [endpoint, apiKey] = await Promise.all([
		getSSMParameter('CAPI_ENDPOINT'),
		getSSMParameter('CAPI_API_KEY'),
	]);

	return fetchArticle({
		endpoint,
		apiKey,
		articleId,
		fields: showFields,
		timeoutMs: CAPI_REQUEST_TIMEOUT_MS,
	});
};

export const createContentRouter = (
	resolveArticle: ResolveArticle = resolveArticleFromCapi,
) =>
	Router().post(
		'/articles/resolve',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		validate({
			body: resolveArticleRequestSchema,
			handler: handleValidationErrors,
		}),
		async (req: Request, res: Response) => {
			const { article, showFields } = req.body as z.infer<
				typeof resolveArticleRequestSchema
			>;
			const articleId = determineArticleId(article);
			if (!articleId) {
				return res
					.status(422)
					.json(
						buildErrorEnvelope(
							req,
							'invalid_article_reference',
							'The article must be a Guardian article URL or content id.',
						),
					);
			}

			try {
				const resolved = await resolveArticle(articleId, showFields);
				return res.status(200).json({
					article: {
						id: resolved.articleId,
						url: resolved.url,
						fields: resolved.fields,
					},
				});
			} catch (error) {
				if (error instanceof CapiError && error.reason === 'not_found') {
					return res
						.status(404)
						.json(
							buildErrorEnvelope(
								req,
								'article_not_found',
								'No Guardian article was found for that link.',
							),
						);
				}

				return res
					.status(502)
					.json(
						buildErrorEnvelope(
							req,
							'capi_unavailable',
							'The Content API could not be reached. Please try again.',
						),
					);
			}
		},
	);

export const contentRouter = createContentRouter();
