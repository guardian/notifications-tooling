import { newsletterSegments } from '@config';
import { getSSMParameter } from '@config/ssm';
import type {
	EmailPreviewRequest,
	EmailPreviewResponse,
	NewsletterSegment,
} from '@models';
import { emailPreviewRequestSchema, UserPermissions } from '@models';
import { EmailRenderingError, renderEmail } from '@services';
import { determineArticleId } from '@utils';
import { type Request, type Response, Router } from 'express';
import validate from 'express-zod-safe';
import { buildErrorEnvelope } from '../../error-envelope';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import { handleValidationErrors } from '../notifications';

/** email-rendering is given a fixed request timeout; it is not configurable per stage. */
const EMAIL_RENDERING_REQUEST_TIMEOUT_MS = 10_000;

type FetchEmailPreview = (
	articleUrl: string,
	segment: NewsletterSegment,
) => Promise<string>;

const fetchEmailPreview: FetchEmailPreview = async (articleUrl, segment) => {
	const emailRenderingEndpoint = await getSSMParameter(
		'EMAIL_RENDERING_ENDPOINT',
	);

	return await renderEmail({
		endpoint: emailRenderingEndpoint,
		articleUrl,
		newsletterId: segment.emailRenderingNewsletterId,
		timeoutMs: EMAIL_RENDERING_REQUEST_TIMEOUT_MS,
		// send a non-empty string so that the preview text element will be rendered
		// and the frontend back add the text content client-side
		previewText: ' ',
	});
};

export const createPreviewRouter = (
	fetchEmail: FetchEmailPreview = fetchEmailPreview,
) =>
	Router().post(
		'/email',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		validate({
			body: emailPreviewRequestSchema,
			handler: handleValidationErrors,
		}),
		async (req: Request, res: Response) => {
			const { article, audience } = req.body as EmailPreviewRequest;
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

			const matchingSegment = Object.entries(newsletterSegments).find(
				([key]) => {
					return audience.includes(key);
				},
			)?.[1];

			if (!matchingSegment) {
				return res
					.status(422)
					.json(
						buildErrorEnvelope(
							req,
							'invalid_audience',
							'The audience must include at least one valid newsletter segment Id.',
						),
					);
			}

			try {
				const html = await Promise.resolve(
					fetchEmail(article, matchingSegment),
				);

				const responseBody: EmailPreviewResponse = {
					articleId,
					html,
					newsletterId: matchingSegment.emailRenderingNewsletterId,
				};

				return res.status(200).json(responseBody);
			} catch (error) {
				if (!(error instanceof EmailRenderingError)) {
					return res
						.status(502)
						.json(
							buildErrorEnvelope(
								req,
								'email_rendering_unavailable',
								'The Email Rendering API could not be reached. Please try again.',
							),
						);
				}

				return res
					.status(error.status ?? 502)
					.json(buildErrorEnvelope(req, error.reason, error.message));
			}
		},
	);

export const previewRouter = createPreviewRouter();
