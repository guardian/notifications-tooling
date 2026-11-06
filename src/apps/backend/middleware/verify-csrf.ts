import type { NextFunction, Request, Response } from 'express';
import { buildErrorEnvelope } from '../error-envelope';
import { CSRF_HEADER_NAME, hasValidCsrfToken } from '../utils/auth/csrf';

/**
 * Double-submit CSRF guard for state-changing routes. Layered on top of
 * {@link verifyOrigin}: where the origin check trusts the browser not to let
 * page script forge the `Origin` header, this adds a secret the attacker
 * cannot obtain — the host-locked token cookie, which only same-origin code
 * (the Dispatch SPA) can read and echo back in `x-csrf-token`.
 *
 * Expected to run after authentication so an unauthenticated request still
 * receives the usual `401` rather than this `403`.
 */
export const verifyCsrfToken = (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	if (
		hasValidCsrfToken(
			request.header('cookie'),
			request.header(CSRF_HEADER_NAME),
		)
	) {
		return next();
	}

	return response
		.status(403)
		.json(
			buildErrorEnvelope(
				request,
				'csrf_token_invalid',
				'A valid CSRF token is required for this request.',
			),
		);
};
