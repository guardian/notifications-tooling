import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { isRunningLocally, pandaSettingsFileName } from '@config';
import {
	guardianValidation,
	PanDomainAuthentication,
	type User,
} from '@guardian/pan-domain-node';

const LOCAL_PROFILE = 'composer';

const panda = new PanDomainAuthentication(
	'gutoolsAuth-assym', // cookie name
	'eu-west-1', // AWS region
	'pan-domain-auth-settings', // Settings bucket
	pandaSettingsFileName, // Settings files
	guardianValidation,
	isRunningLocally
		? fromIni({ profile: LOCAL_PROFILE })
		: fromNodeProviderChain(),
);

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
