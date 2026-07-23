import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import type {
	Request as ExpressRequest,
	Response as ExpressResponse,
} from 'express';
import { startTestServer, type TestServer } from '../../test-utils/server';
import { sampleUser, type User, userHandler } from './index';

describe('user handler', () => {
	it('responds with the sample user', () => {
		const json = mock<(body: unknown) => void>(() => {});
		const res = { json } as unknown as ExpressResponse;

		userHandler({} as ExpressRequest, res);

		expect(json).toHaveBeenCalledTimes(1);
		expect(json.mock.calls[0]?.[0]).toEqual(sampleUser);
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

	it('returns 200 with the sample user as JSON', async () => {
		const response = await getUser();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toEqual(sampleUser);
	});

	it('returns a body matching the User interface shape', async () => {
		const response = await getUser();
		const body = (await response.json()) as User;

		expect(typeof body.firstName).toBe('string');
		expect(typeof body.lastName).toBe('string');
		expect(typeof body.email).toBe('string');
		expect(
			body.avatarUrl === undefined || typeof body.avatarUrl === 'string',
		).toBe(true);
		expect(typeof body.authenticatingSystem).toBe('string');
		expect(Array.isArray(body.authenticatedIn)).toBe(true);
		expect(body.authenticatedIn.every((app) => typeof app === 'string')).toBe(
			true,
		);
		expect(typeof body.expires).toBe('number');
		expect(typeof body.multifactor).toBe('boolean');
	});
});
