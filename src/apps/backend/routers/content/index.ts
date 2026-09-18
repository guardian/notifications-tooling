import { getSSMParameter } from '@config/ssm';
import type {
	LatestArticle,
	LatestArticlesResponse,
	ResolveArticleRequest,
	ResolveArticleResponse,
} from '@models';
import {
	CapiError,
	resolveArticleRequestSchema,
	type ResolvedArticle,
	UserPermissions,
} from '@models';
import { fetchArticle, fetchLatestArticles } from '@services';
import { determineArticleId } from '@utils';
import { type Request, type Response, Router } from 'express';
import validate from 'express-zod-safe';
import { buildErrorEnvelope } from '../../error-envelope';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import { handleValidationErrors } from '../notifications';

/** CAPI is given a fixed request timeout; it is not configurable per stage. */
const CAPI_REQUEST_TIMEOUT_MS = 10_000;
const latestArticlesWindowMs = 24 * 60 * 60 * 1000;

type ResolveArticle = (articleId: string) => Promise<ResolvedArticle>;
type ListLatestArticles = (
	fromDate: Date,
	toDate: Date,
) => Promise<LatestArticle[]>;

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

const listLatestArticlesFromCapi: ListLatestArticles = async (
	fromDate,
	toDate,
) => {
	const [endpoint, apiKey] = await Promise.all([
		getSSMParameter('CAPI_ENDPOINT'),
		getSSMParameter('CAPI_API_KEY'),
	]);

	return fetchLatestArticles({
		endpoint,
		apiKey,
		fromDate,
		toDate,
		timeoutMs: CAPI_REQUEST_TIMEOUT_MS,
	});
};

export const createContentRouter = (
	resolveArticle: ResolveArticle = resolveArticleFromCapi,
	listLatestArticles: ListLatestArticles = listLatestArticlesFromCapi,
	now: () => Date = () => new Date(),
) => {
	const router = Router();

	router.get(
		'/articles/latest',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		async (req: Request, res: Response) => {
			try {
				const toDate = now();
				const fromDate = new Date(toDate.getTime() - latestArticlesWindowMs);
				const articles = await listLatestArticles(fromDate, toDate);
				const responseBody: LatestArticlesResponse = { articles };
				return res.status(200).json(responseBody);
			} catch {
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

	router.post(
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
				const resolvedArticle = await resolveArticle(articleId);
				let requestedUrl: string | undefined;
				let requestedBlock: ResolveArticleResponse['requestedBlock'] =
					resolvedArticle.type === 'liveblog'
						? resolvedArticle.blocks?.main
						: undefined;

				try {
					const url = new URL(article);
					const requestedBlockId = url.hash.slice(1);
					if (requestedBlockId.startsWith('block-')) {
						const capiBlockId = requestedBlockId.slice('block-'.length);
						const matchingBlock = resolvedArticle.blocks?.body?.find(
							({ id }) => id === capiBlockId || id === requestedBlockId,
						);
						if (resolvedArticle.type !== 'liveblog' || !matchingBlock) {
							return res
								.status(422)
								.json(
									buildErrorEnvelope(
										req,
										'invalid_article_reference',
										'The imported liveblog block ID is invalid.',
									),
								);
						}
						requestedBlock = { ...matchingBlock, id: requestedBlockId };
						requestedUrl = article;
					}
				} catch {
					// Bare content ids do not carry a requested block.
				}

				const responseBody: ResolveArticleResponse = {
					article: resolvedArticle,
					...(requestedUrl ? { requestedUrl } : {}),
					...(requestedBlock ? { requestedBlock } : {}),
				};
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

	return router;
};

export const contentRouter = createContentRouter();
