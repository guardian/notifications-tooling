import { UserPermissions } from '@config';
import { getSSMParameter } from '@config/ssm';
import { type ArticleSummary, CapiError, fetchArticleSummary } from '@services';
import { guardianArticleIdFromUrl } from '@utils';
import { type Request, type Response, Router } from 'express';
import validate from 'express-zod-safe';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import { handleValidationErrors } from '../notifications';

/** CAPI is given a fixed request timeout; it is not configurable per stage. */
const CAPI_REQUEST_TIMEOUT_MS = 10_000;

/** Body for `POST /v1/content/link/resolve`: a single Guardian article URL. */
export const parseLinkRequestSchema = z.strictObject({
	link: z.strictObject({
		url: z.string().trim().min(1).meta({
			description: 'A Guardian article URL to resolve against the Content API.',
			example: 'https://www.theguardian.com/environment/2026/jul/19/a-headline',
		}),
	}),
});

type ResolveArticle = (articleId: string) => Promise<ArticleSummary>;

/**
 * Default resolver: reads the CAPI endpoint and key from SSM, then looks the
 * article up. Injectable so handler tests can drive the outcomes without a
 * network call or credentials.
 */
const resolveArticleFromCapi: ResolveArticle = async (articleId) => {
	const [endpoint, apiKey] = await Promise.all([
		getSSMParameter('CAPI_ENDPOINT'),
		getSSMParameter('CAPI_API_KEY'),
	]);

	return fetchArticleSummary({
		endpoint,
		apiKey,
		articleId,
		timeoutMs: CAPI_REQUEST_TIMEOUT_MS,
	});
};

const requestId = (req: Request): string | undefined =>
	(req as { id?: string }).id;

export const createContentRouter = (
	resolveArticle: ResolveArticle = resolveArticleFromCapi,
) =>
	Router().post(
		'/link/resolve',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		validate({
			body: parseLinkRequestSchema,
			handler: handleValidationErrors,
		}),
		async (req: Request, res: Response) => {
			const { url } = (req.body as z.infer<typeof parseLinkRequestSchema>).link;
			const articleId = guardianArticleIdFromUrl(url);
			if (!articleId) {
				return res.status(422).json({
					error: 'invalid_url',
					message: 'The link must be a Guardian article URL.',
					requestId: requestId(req),
				});
			}

			try {
				const article = await resolveArticle(articleId);
				return res.status(200).json(article);
			} catch (error) {
				if (error instanceof CapiError && error.reason === 'not_found') {
					return res.status(404).json({
						error: 'article_not_found',
						message: 'No Guardian article was found for that link.',
						requestId: requestId(req),
					});
				}

				return res.status(502).json({
					error: 'capi_unavailable',
					message: 'The Content API could not be reached. Please try again.',
					requestId: requestId(req),
				});
			}
		},
	);

export const contentRouter = createContentRouter();
