import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import type {
	Request as ExpressRequest,
	Response as ExpressResponse,
} from 'express';
import { startTestServer, type TestServer } from '../../test-utils/server';
import {
	samplePermissions,
	sampleUser,
	userHandler,
	type UserResponse,
} from './index';

describe('user handler', () => {
	it('responds with the user wrapped under `user` and their permissions', () => {
		const json = mock<(body: unknown) => void>(() => {});
		const res = { json } as unknown as ExpressResponse;

		userHandler({} as ExpressRequest, res);

		expect(json).toHaveBeenCalledTimes(1);
		expect(json.mock.calls[0]?.[0]).toEqual({
			user: sampleUser,
			permissions: samplePermissions,
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
		server = await startTestServer();
		baseUrl = server.baseUrl;
	});

	afterAll(async () => {
		await server.close();
	});

	const getUser = (): Promise<Response> => fetch(`${baseUrl}/v1/user`);

	it('returns 200 with the user and permissions as JSON', async () => {
		const response = await getUser();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toEqual({
			user: sampleUser,
			permissions: samplePermissions,
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

	it('includes the DispatchAccess permission from guardian/permissions#400', async () => {
		const response = await getUser();
		const { permissions } = (await response.json()) as UserResponse;

		expect(permissions).toContainEqual({
			name: 'DispatchAccess',
			description: 'Access to Dispatch',
			active: true,
		});
	});

	it('returns permissions matching the Permission interface shape', async () => {
		const response = await getUser();
		const { permissions } = (await response.json()) as UserResponse;

		expect(Array.isArray(permissions)).toBe(true);
		for (const permission of permissions) {
			expect(typeof permission.name).toBe('string');
			expect(typeof permission.description).toBe('string');
			expect(typeof permission.active).toBe('boolean');
		}
	});
});
