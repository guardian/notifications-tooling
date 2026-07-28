import { env, isRunningLocally, USER_PERMISSIONS } from '@config';
import { init } from '@guardian/permissions-client';

// Only permissions on this whitelist are exposed to users; anything else the
// store returns is filtered out.
const whitelistedPermissions = new Set<string>(Object.values(USER_PERMISSIONS));

// The permissions cache is only published to the CODE and PROD buckets; DEV
// reads the CODE cache.
const permissionsStoreStage = env.STAGE === 'PROD' ? 'PROD' : 'CODE';

// Constructed lazily so merely importing this module (e.g. when the app is
// loaded) does not build an S3 client or eagerly fetch the cache — `init`
// kicks off a background refresh as soon as it runs.
let permissionsStore: ReturnType<typeof init> | undefined;

const getPermissionsStore = (): ReturnType<typeof init> => {
	permissionsStore ??= init({
		stage: permissionsStoreStage,
		isRunningLocally,
	});
	return permissionsStore;
};

export const listUserPermissions = async (
	userId: string,
): Promise<string[]> => {
	const permissions = await getPermissionsStore().listUserPermissions(userId);
	return permissions.filter((permission) =>
		whitelistedPermissions.has(permission),
	);
};
