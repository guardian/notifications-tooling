import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import {
	guardianValidation,
	PanDomainAuthentication,
} from '@guardian/pan-domain-node';
import type { NextFunction, Request, Response } from 'express';

export interface AuthenticatedRequest extends Request {
	userEmail?: string;
}

const LOCAL_PROFILE = 'composer';
const IS_RUNNING_LOCALLY = !process.env.LAMBDA_TASK_ROOT;
const stage = process.env.STAGE ?? 'DEV';
const settingsFileName = (stage: string) => {
	switch (stage) {
		case 'DEV':
			return 'local.dev-gutools.co.uk.settings.public';
		case 'CODE':
			return 'code.dev-gutools.co.uk.settings.public';
		case 'PROD':
			return 'gutools.co.uk.settings.public';
		default:
			throw new Error(`Unknown stage: ${stage}`);
	}
};

const loginHostLookup = (stage: string) => {
	switch (stage) {
		case 'DEV':
			return 'login.local.dev-gutools.co.uk';
		case 'CODE':
			return 'login.code.dev-gutools.co.uk';
		case 'PROD':
			return 'login.gutools.co.uk';
		default:
			throw new Error(`Unknown stage: ${stage}`);
	}
};

const panda = new PanDomainAuthentication(
	'gutoolsAuth-assym', // cookie name
	'eu-west-1', // AWS region
	'pan-domain-auth-settings', // Settings bucket
	settingsFileName(stage), // Settings files
	guardianValidation,
	IS_RUNNING_LOCALLY
		? fromIni({ profile: LOCAL_PROFILE })
		: fromNodeProviderChain(),
);

export const authMiddleware = async (
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) => {
	const maybeCookieHeader = request.header('Cookie');
	if (maybeCookieHeader) {
		const result = await panda.verify(maybeCookieHeader);

		if (result.success) {
			return next();
		}
	}

	const returnUrl = `https://${request.hostname}${request.originalUrl}`;
	const redirectTo = `https://${loginHostLookup(stage)}/login?returnUrl=${returnUrl}`;

	return response.redirect(redirectTo);
};
