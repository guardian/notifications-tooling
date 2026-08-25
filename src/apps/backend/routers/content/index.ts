import { getSSMParameter } from '@config/ssm';
import type { ResolveArticleRequest, ResolveArticleResponse } from '@models';
import {
	CapiError,
	resolveArticleRequestSchema,
	type ResolvedArticle,
	UserPermissions,
} from '@models';
import { fetchArticle } from '@services';
import { determineArticleId } from '@utils';
import { type Request, type Response, Router } from 'express';
import validate from 'express-zod-safe';
import { buildErrorEnvelope } from '../../error-envelope';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import { handleValidationErrors } from '../notifications';

/** CAPI is given a fixed request timeout; it is not configurable per stage. */
const CAPI_REQUEST_TIMEOUT_MS = 10_000;

type ResolveArticle = (articleId: string) => Promise<ResolvedArticle>;

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

	return fetchArticle({
		endpoint,
		apiKey,
		articleId,
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
			const { article } = req.body as ResolveArticleRequest;
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
				const article = await resolveArticle(articleId);
				const responseBody: ResolveArticleResponse = { article };
				return res.status(200).json(responseBody);
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
