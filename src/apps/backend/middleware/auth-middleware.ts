import { env } from '@config';
import type { NextFunction, Request, Response } from 'express';
import { buildErrorEnvelope } from '../error-envelope';
import { verifyCookie } from '../utils/auth/pan-domain-authentication';

const loginHostLookup = () => {
	switch (env.STAGE) {
		case 'DEV':
			return 'login.local.dev-gutools.co.uk';
		case 'CODE':
			return 'login.code.dev-gutools.co.uk';
		case 'PROD':
			return 'login.gutools.co.uk';
	}
};

/**
 * Builds the pan-domain login URL, so the stage-to-login-host mapping lives in
 * exactly one place.
 *
 * `includeReturnUrl` exists because the two callers need opposite things from
 * `originalUrl`. On a document navigation it is the page the user asked for, so
 * returning them to it is correct. On a JSON 401 it is an API path
 * (`/v1/channels/constraints`), and sending a logged-in user there would land
 * them on raw JSON rather than the SPA — so the return URL is omitted and the
 * browser, the only party that knows which page is open, appends its own.
 * See docs/ADRs/login-redirect-ownership.md.
 */
const getLoginUrl = (
	request: Request,
	{ includeReturnUrl }: { includeReturnUrl: boolean },
) => {
	const loginUrl = new URL('/login', `https://${loginHostLookup()}`);
	if (includeReturnUrl) {
		loginUrl.searchParams.set(
			'returnUrl',
			`https://${request.hostname}${request.originalUrl}`,
		);
	}
	return loginUrl.toString();
};

export const authMiddleware = async (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	const result = await verifyCookie(request.header('Cookie'));
	if (result.success) {
		request.user = result.user;
		return next();
	}

	return response.status(401).json({
		...buildErrorEnvelope(
			request,
			'unauthenticated',
			'Authentication is required to access this resource.',
		),
		loginUrl: getLoginUrl(request, { includeReturnUrl: false }),
	});
};

export const authRedirectMiddleware = async (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	const result = await verifyCookie(request.header('Cookie'));

	console.log('AUTH DEBUG', {
		url: request.originalUrl,
		hasCookie: Boolean(result),
		success: result.success,
		reason: result.success,
	});
	if (result.success) {
		request.user = result.user;
		return next();
	}

	return response.redirect(getLoginUrl(request, { includeReturnUrl: true }));
};
