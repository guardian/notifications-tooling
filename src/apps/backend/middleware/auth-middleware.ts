import { env } from '@config';
import type { NextFunction, Request, Response } from 'express';
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

const getLoginUrl = (request: Request) => {
	const returnUrl = `https://${request.hostname}${request.originalUrl}`;
	const loginUrl = new URL('/login', `https://${loginHostLookup()}`);
	loginUrl.searchParams.set('returnUrl', returnUrl);
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
		error: 'unauthenticated',
		message: 'Authentication is required to access this resource.',
		loginUrl: getLoginUrl(request),
	});
};

export const authRedirectMiddleware = async (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	console.log('Before verifyCookie');

	const result = await verifyCookie(request.header('Cookie'));

	console.log('After verifyCookie');

	if (result.success) {
		request.user = result.user;
		return next();
	}

	return response.redirect(getLoginUrl(request));
};
