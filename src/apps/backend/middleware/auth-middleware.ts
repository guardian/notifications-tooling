import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import {
	guardianValidation,
	PanDomainAuthentication,
} from '@guardian/pan-domain-node';
import type { NextFunction, Request, Response } from 'express';

const MISSING_AUTH_COOKIE_MESSAGE =
	'pan-domain auth cookie missing, invalid or expired';

export interface AuthenticatedRequest extends Request {
	userEmail?: string;
}

const LOCAL_PROFILE = 'composer';
const IS_RUNNING_LOCALLY = !process.env.LAMBDA_TASK_ROOT;

const panda = new PanDomainAuthentication(
	'gutoolsAuth-assym', // cookie name
	'eu-west-1', // AWS region
	'pan-domain-auth-settings', // Settings bucket
	'local.dev-gutools.co.uk.settings.public', // Settings files
	guardianValidation,
	IS_RUNNING_LOCALLY
		? fromIni({ profile: LOCAL_PROFILE })
		: fromNodeProviderChain(),
);

const getVerifiedUserEmail = async (
	cookieHeader: string | undefined,
): Promise<void | string> => {
	if (cookieHeader) {
		const result = await panda.verify(cookieHeader);

		if (result.success) {
			return result.user.email;
		}
	}
};

export const authMiddleware = async (
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) => {
	const maybeCookieHeader = request.header('Cookie');
	const maybeAuthenticatedEmail = await getVerifiedUserEmail(maybeCookieHeader);

	if (!maybeAuthenticatedEmail) {
		return response.status(403).send(MISSING_AUTH_COOKIE_MESSAGE);
	} else {
		return next();
	}
};
