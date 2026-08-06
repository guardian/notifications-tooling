import type { ErrorRequestHandler } from 'express';
import { BrazeApiError } from '../notification-channels/email/braze/client';
import { EmailRenderingError } from '../notification-channels/email/rendering/client';

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

	res.status(500).json({ error: 'Internal Server Error' });
};
