import { env } from '@config';
import type { NextFunction, Request, Response } from 'express';
import { isCookieValid } from '../auth/pan-domain-authentication';

const loginHostLookup = () => {
	switch (env.STAGE) {
		case 'DEV':
			return 'login.local.dev-gutools.co.uk';
		case 'CODE':
			return 'login.code.dev-gutools.co.uk';
		case 'PROD':
			return 'login.gutools.co.uk';
		default:
			throw new Error(`Unknown stage: ${env}`);
	}
};

export const authMiddleware = async (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	const validCookie = await isCookieValid(request.header('Cookie'));
	if (validCookie) {
		return next();
	}

	const returnUrl = `https://${request.hostname}${request.originalUrl}`;
	const redirectTo = `https://${loginHostLookup()}/login?returnUrl=${returnUrl}`;

	return response.redirect(redirectTo);
};
