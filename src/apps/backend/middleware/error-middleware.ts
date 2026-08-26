import {
	AppNotificationApiError,
	BrazeApiError,
	BrazePushRecipientNotFoundError,
	EmailRenderingError,
} from '@services';
import type { ErrorRequestHandler } from 'express';
import { buildErrorEnvelope } from '../error-envelope';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
	req.log.error(err);

	if (err instanceof EmailRenderingError && err.status === 404) {
		res.status(422).json({
			error: 'email_rendering_failed',
			message: 'The article could not be found by email rendering.',
		});
		return;
	}

	if (err instanceof EmailRenderingError) {
		res.status(err.reason === 'timeout' ? 504 : 502).json({
			error: 'email_rendering_failed',
			message: 'Email rendering is currently unavailable.',
		});
		return;
	}

	if (err instanceof BrazeApiError) {
		res.status(err.reason === 'timeout' ? 504 : 502).json({
			error: 'braze_request_failed',
			message: 'Braze could not complete the request.',
		});
		return;
	}

	if (err instanceof BrazePushRecipientNotFoundError) {
		res.status(422).json({
			error: 'braze_push_recipient_not_found',
			message: 'No push-capable Braze profile matched a recipient.',
		});
		return;
	}

	if (err instanceof AppNotificationApiError) {
		res.status(err.reason === 'timeout' ? 504 : 502).json({
			error: 'app_notification_failed',
			message: 'The app notification service could not complete the request.',
		});
		return;
	}

	res
		.status(500)
		.json(
			buildErrorEnvelope(
				req,
				'internal_error',
				'The request could not be completed.',
			),
		);
};
