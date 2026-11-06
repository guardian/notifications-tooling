import { env } from 'config';
import type { NextFunction, Request, Response } from 'express';
import { buildErrorEnvelope } from '../error-envelope';

/** Dispatch's own web origin per stage; the only origin allowed to mutate. */
const dispatchOriginLookup = (): string => {
	switch (env.STAGE) {
		case 'DEV':
			return 'https://dispatch.local.dev-gutools.co.uk';
		case 'CODE':
			return 'https://dispatch.code.dev-gutools.co.uk';
		case 'PROD':
			return 'https://dispatch.gutools.co.uk';
	}
};

const stateChangingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * The browser-set origin of the request, taken from `Origin` and falling back
 * to the origin of `Referer`. Page script cannot forge or strip either header,
 * so they are a trustworthy witness of who issued the request.
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
 * Rejects state-changing requests that carry a cross-origin `Origin`/`Referer`.
 *
 * The pan-domain cookie is shared across every `*.gutools.co.uk` host, so cookie
 * auth alone lets any gutools origin forge a send on a logged-in user's behalf
 * (CSRF). `SameSite` cannot help: sibling subdomains are same-site, so the cookie
 * rides along regardless. The browser always attaches an unforgeable `Origin` to
 * a cross-origin (or form) `POST`, so requiring it to match Dispatch's own origin
 * closes the vector — including the same-site subdomain case.
 *
 * A request with no `Origin`/`Referer` at all is not a browser-driven CSRF (the
 * browser forces the header on mutating requests), so it is allowed through:
 * that path is reserved for non-browser callers, which must already hold the
 * cookie themselves and so are out of scope for CSRF.
 */
export const verifyOrigin = (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	if (!stateChangingMethods.has(request.method)) {
		return next();
	}

	const origin = requestOrigin(request);
	if (origin === undefined || origin === dispatchOriginLookup()) {
		return next();
	}

	return response
		.status(403)
		.json(
			buildErrorEnvelope(
				request,
				'forbidden',
				'The request did not originate from Dispatch.',
			),
		);
};
