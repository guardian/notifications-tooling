import { env } from '@config';
import type { NextFunction, Request, Response } from 'express';
import { verifyCookie } from '../auth/pan-domain-authentication';

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

	const returnUrl = `https://${request.hostname}${request.originalUrl}`;
	const loginUrl = new URL('/login', `https://${loginHostLookup()}`);

	loginUrl.searchParams.set('returnUrl', returnUrl);

	return response.status(401).json({
		error: 'unauthenticated',
		message: 'Authentication is required to access this resource.',
		loginUrl: loginUrl.toString(),
	});
};
