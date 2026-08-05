import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import type { UserResponse } from '@models';
import { UserPermissions } from '@config';
import type {
	Request as ExpressRequest,
	Response as ExpressResponse,
} from 'express';
import {
	assertUnauthenticatedRequestBlocked,
	authenticateRequests,
	installPandaAuthMock,
	testUser,
} from '../../utils/test-utils/panda-auth';
import {
	grantPermissions,
	installPermissionsStoreMock,
} from '../../utils/test-utils/permissions';
import type { TestServer } from '../../utils/test-utils/server';

// Stub Panda verification and the permissions store before the app (and its
// real clients) are imported.
installPandaAuthMock();
installPermissionsStoreMock();
const { startTestServer } = await import('../../utils/test-utils/server');
const { userHandler } = await import('./index');

const userPermissions = [UserPermissions.DispatchAccess];

describe('user handler', () => {
	it('responds with the user wrapped under `user` and their permission names', async () => {
		grantPermissions(userPermissions);
		const json = mock<(body: unknown) => void>(() => {});
		const res = { json } as unknown as ExpressResponse;

		await userHandler({ user: testUser } as unknown as ExpressRequest, res);

		expect(json).toHaveBeenCalledTimes(1);
		expect(json.mock.calls[0]?.[0]).toEqual({
			user: testUser,
			permissions: userPermissions,
		});
	});
});

/**
 * Drives the real Express app over HTTP so the whole `GET /v1/user` chain runs
 * through the mounted router.
 */
describe('GET /v1/user', () => {
	let server: TestServer;
	let baseUrl: string;

	beforeAll(async () => {
		authenticateRequests(testUser);
		grantPermissions(userPermissions);
		server = await startTestServer();
		baseUrl = server.baseUrl;
	});

	afterAll(async () => {
		await server.close();
	});

	const getUser = (): Promise<Response> => fetch(`${baseUrl}/v1/user`);

	it('blocks unauthenticated GET /v1/user', async () => {
		await assertUnauthenticatedRequestBlocked(baseUrl, {
			method: 'GET',
			path: '/v1/user',
		});
	});

	it('returns 200 with the user and permissions as JSON', async () => {
		const response = await getUser();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toEqual({
			user: testUser,
			permissions: userPermissions,
		});
	});

	it('wraps the user data under `user` matching the User interface shape', async () => {
		const response = await getUser();
		const { user } = (await response.json()) as UserResponse;

		expect(typeof user.firstName).toBe('string');
		expect(typeof user.lastName).toBe('string');
		expect(typeof user.email).toBe('string');
		expect(
			user.avatarUrl === undefined || typeof user.avatarUrl === 'string',
		).toBe(true);
		expect(typeof user.authenticatingSystem).toBe('string');
		expect(Array.isArray(user.authenticatedIn)).toBe(true);
		expect(user.authenticatedIn.every((app) => typeof app === 'string')).toBe(
			true,
		);
		expect(typeof user.expires).toBe('number');
		expect(typeof user.multifactor).toBe('boolean');
	});

	it('lists the permissions the store returns for the user', async () => {
		const response = await getUser();
		const { permissions } = (await response.json()) as UserResponse;

		expect(permissions).toContain(UserPermissions.DispatchAccess);
	});

	it('returns an empty list when the store grants the user nothing', async () => {
		grantPermissions([]);
		try {
			const response = await getUser();
			const { permissions } = (await response.json()) as UserResponse;

			expect(permissions).toEqual([]);
		} finally {
			grantPermissions(userPermissions);
		}
	});

	it('returns permissions as an array of permission-name strings', async () => {
		const response = await getUser();
		const { permissions } = (await response.json()) as UserResponse;

		expect(Array.isArray(permissions)).toBe(true);
		for (const permission of permissions) {
			expect(typeof permission).toBe('string');
		}
	});
});
