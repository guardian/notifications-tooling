import { dispatchOrigin } from 'config';
import type { NextFunction, Request, Response } from 'express';
import { buildErrorEnvelope } from '../error-envelope';

/**
 * The browser-set origin of the request, taken from `Origin` and falling back
 * to the origin of `Referer`. Page script cannot forge either header (a page
 * can suppress `Referer`, but browsers always send `Origin` on a `POST`).
 */
const requestOrigin = (request: Request): string | undefined => {
	const origin = request.get('origin');
	if (origin) {
		return origin;
	}

	const referer = request.get('referer');
	if (!referer) {
		return undefined;
	}

	try {
		return new URL(referer).origin;
	} catch {
		return undefined;
	}
};

/**
 * Rejects requests that carry a cross-origin `Origin`/`Referer`.
 *
 * The pan-domain cookie is shared across every `*.gutools.co.uk` host, so cookie
 * auth alone lets any gutools origin forge a send on a logged-in user's behalf
 * (CSRF). `SameSite` cannot help: sibling subdomains are same-site, so the cookie
 * rides along regardless. The browser always attaches an unforgeable `Origin` to
 * a cross-origin (or form) `POST`, so requiring it to match Dispatch's own origin
 * closes the vector — including the same-site subdomain case.
 *
 * A request with neither header is let through: it is not browser-issued, and
 * {@link verifyCsrfToken} still requires the double-submit token.
 */
export const verifyOrigin = (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	const origin = requestOrigin(request);
	if (origin === undefined || origin === dispatchOrigin) {
		return next();
	}

	return response
		.status(403)
		.json(
			buildErrorEnvelope(
				request,
				'origin_not_allowed',
				'The request did not originate from Dispatch.',
			),
		);
};
