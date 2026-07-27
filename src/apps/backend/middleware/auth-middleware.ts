import { env } from '@config';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { User } from '@guardian/pan-domain-node';
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
		reason: 'Unauthenticated',
		loginUrl: loginUrl.toString(),
	});
};

/**
 * A {@link Request} guaranteed to carry an authenticated `user` — the shape a
 * handler sees once it sits behind {@link authMiddleware}.
 */
export interface AuthenticatedRequest extends Request {
	user: User;
}

/**
 * Adapts a handler that requires an authenticated user into a standard Express
 * {@link RequestHandler}. The `req.user` narrowing is sound only because the
 * wrapped handler is always mounted after {@link authMiddleware}, which
 * populates `req.user` (or short-circuits with 401) before it runs.
 */
export const authenticated =
	(
		handler: (req: AuthenticatedRequest, res: Response) => void,
	): RequestHandler =>
	(req, res) =>
		handler(req as AuthenticatedRequest, res);
