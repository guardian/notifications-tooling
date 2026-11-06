import type { NextFunction, Request, Response } from 'express';
import { buildErrorEnvelope } from '../error-envelope';

/**
 * Rejects request bodies that are not `application/json` with a `415`.
 *
 * The app parses URL-encoded bodies globally, so without this guard a
 * state-changing route would also accept an HTML form submission — the classic
 * CSRF vehicle. Requiring JSON means a cross-origin browser request can only
 * reach the handler after a CORS preflight, which Dispatch does not grant.
 */
export const requireJsonBody = (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	if (request.is('application/json')) {
		return next();
	}

	return response
		.status(415)
		.json(
			buildErrorEnvelope(
				request,
				'unsupported_media_type',
				'The request body must be sent as application/json.',
			),
		);
};
