import { expect, mock } from 'bun:test';

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

export interface PermissionGatedEndpoint {
	method: string;
	path: string;
	body?: unknown;
}

/**
 * Drives a single request at a `requirePermissions`-protected endpoint with the
 * permissions store returning no permissions for the user, asserting the shared
 * `403 Insufficient permissions` envelope. The empty-permissions result is
 * applied for one call only, so it does not disturb any permissions granted via
 * {@link grantPermissions} for surrounding tests.
 */
export const assertInsufficientPermissionsRequestBlocked = async (
	baseUrl: string,
	{ method, path, body }: PermissionGatedEndpoint,
): Promise<void> => {
	listUserPermissionsMock.mockImplementationOnce(() => Promise.resolve([]));

	const response = await fetch(`${baseUrl}${path}`, {
		method,
		redirect: 'manual',
		...(body ?? {
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}),
	});

	expect(response.status).toBe(403);
	expect(response.headers.get('content-type')).toContain('application/json');

	const responseBody = (await response.json()) as {
		error: string;
		message: string;
	};
	expect(responseBody.error).toBe('insufficient_permissions');
	expect(responseBody.message).toBe(
		'You do not have permission to access this resource.',
	);
};
