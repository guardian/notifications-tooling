import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import {
	guardianValidation,
	PanDomainAuthentication,
	type User,
} from '@guardian/pan-domain-node';
import { isRunningLocally, pandaSettingsFileName } from 'config';

const LOCAL_PROFILE = 'composer';

const pandaPromise = PanDomainAuthentication.builder({
	cookieName: 'gutoolsAuth-assym',
	region: 'eu-west-1',
	bucket: 'pan-domain-auth-settings',
	keyFile: pandaSettingsFileName,
	validateUser: guardianValidation,
	credentialsProvider: isRunningLocally
		? fromIni({ profile: LOCAL_PROFILE })
		: fromNodeProviderChain(),
});

export type CookieVerificationResult =
	{ success: true; user: User } | { success: false };

export const verifyCookie = async (
	cookieHeader?: string,
): Promise<CookieVerificationResult> => {
	const panda = await pandaPromise;
	const result = await panda.verify(cookieHeader);

	if (result.success) {
		return { success: true, user: result.user };
	}

	return { success: false };
};
