import { mock } from 'bun:test';

export const listUserPermissionsMock = mock<
	(userId: string) => Promise<string[]>
>(() => Promise.resolve([]));

export const installPermissionsStoreMock = (): void => {
	void mock.module('../permissions/permissions-store', () => ({
		listUserPermissions: listUserPermissionsMock,
	}));
};

/**
 * Make {@link listUserPermissionsMock} return the given permission names for any
 * user.
 */
export const grantPermissions = (permissionNames: string[] = []): void => {
	listUserPermissionsMock.mockImplementation(() =>
		Promise.resolve(permissionNames),
	);
};
