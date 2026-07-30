import type { UserPermissions } from '@config';
import { listUserPermissions } from './permissions-store';

export const checkPermissions = async (
	userEmail: string,
	requiredPermissions: UserPermissions[],
): Promise<boolean> => {
	const userPermissions = await listUserPermissions(userEmail);
	return requiredPermissions.every((permission) =>
		userPermissions.includes(permission),
	);
};
