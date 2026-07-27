import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { env } from '@config';
import {
	guardianValidation,
	PanDomainAuthentication,
	type User,
} from '@guardian/pan-domain-node';

const LOCAL_PROFILE = 'composer';
const IS_RUNNING_LOCALLY = !process.env.LAMBDA_TASK_ROOT;
const settingsFileName = () => {
	switch (env.STAGE) {
		case 'DEV':
			return 'local.dev-gutools.co.uk.settings.public';
		case 'CODE':
			return 'code.dev-gutools.co.uk.settings.public';
		case 'PROD':
			return 'gutools.co.uk.settings.public';
	}
};

const panda = new PanDomainAuthentication(
	'gutoolsAuth-assym', // cookie name
	'eu-west-1', // AWS region
	'pan-domain-auth-settings', // Settings bucket
	settingsFileName(), // Settings files
	guardianValidation,
	IS_RUNNING_LOCALLY
		? fromIni({ profile: LOCAL_PROFILE })
		: fromNodeProviderChain(),
);

/**
 * The outcome of verifying a Panda cookie: on success the resolved `user` is
 * included; on failure only the discriminant is returned.
 */
export type CookieVerificationResult =
	{ success: true; user: User } | { success: false };

export const verifyCookie = async (
	cookieHeader?: string,
): Promise<CookieVerificationResult> => {
	const result = await panda.verify(cookieHeader);

	if (result.success) {
		return { success: true, user: result.user };
	}

	return { success: false };
};
