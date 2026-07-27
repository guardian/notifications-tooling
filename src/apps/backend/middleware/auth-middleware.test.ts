import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { User } from '@guardian/pan-domain-node';
import type { Request, Response } from 'express';
import type { CookieVerificationResult } from '../utils/auth/pan-domain-authentication';

const verifyCookie = mock<
	(cookieHeader?: string) => Promise<CookieVerificationResult>
>(() => Promise.resolve({ success: false }));

await mock.module('../utils/auth/pan-domain-authentication', () => ({
	verifyCookie,
}));

const { authMiddleware } = await import('./auth-middleware');

const sampleUser: User = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada.lovelace@guardian.co.uk',
	authenticatingSystem: 'notifications-tooling',
	authenticatedIn: ['notifications-tooling'],
	expires: Date.now() + 60 * 60 * 1000,
	multifactor: true,
};

const mockNextFunction = mock(() => undefined);

const createMockRequest = (cookieHeader?: string): Request =>
	({
		header: (name: string) => (name === 'Cookie' ? cookieHeader : undefined),
		hostname: 'dispatch.test.dev-gutools.co.uk',
		originalUrl: '/v1/notifications',
	}) as unknown as Request;

const createMockResponse = () => {
	const json = mock((body: unknown) => body);
	const status = mock(() => ({ json }));

	return {
		status,
		json,
		response: {
			status,
		} as unknown as Response,
	};
};

describe('auth-middleware', () => {
	afterEach(() => {
		mockNextFunction.mockReset();
		verifyCookie.mockReset();
		verifyCookie.mockImplementation(() => Promise.resolve({ success: false }));
	});

	it('should respond with 401 and login url where no cookie is provided', async () => {
		const mockRequest = createMockRequest();
		const { status, json, response } = createMockResponse();

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(verifyCookie).toHaveBeenCalledWith(undefined);
		expect(status).toHaveBeenCalledTimes(1);
		expect(status).toHaveBeenCalledWith(401);

		const body = json.mock.calls[0]?.[0] as {
			error: string;
			message: string;
			loginUrl: string;
		};
		expect(body.error).toBe('unauthenticated');
		expect(body.message).toBe(
			'Authentication is required to access this resource.',
		);
		expect(body.loginUrl).toContain(
			'/login?returnUrl=https%3A%2F%2Fdispatch.test.dev-gutools.co.uk%2Fv1%2Fnotifications',
		);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('should respond with 401 where the cookie is invalid', async () => {
		const mockRequest = createMockRequest('gutoolsAuth-assym=expired-cookie');
		const { status, response } = createMockResponse();

		verifyCookie.mockResolvedValueOnce({ success: false });

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(verifyCookie).toHaveBeenCalledWith(
			'gutoolsAuth-assym=expired-cookie',
		);
		expect(status).toHaveBeenCalledTimes(1);
		expect(status).toHaveBeenCalledWith(401);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('calls next and injects the user where authenticated', async () => {
		const mockRequest = createMockRequest('gutoolsAuth-assym=valid-cookie');
		const { status, response } = createMockResponse();

		verifyCookie.mockResolvedValueOnce({ success: true, user: sampleUser });

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(verifyCookie).toHaveBeenCalledWith('gutoolsAuth-assym=valid-cookie');
		expect(mockRequest.user).toEqual(sampleUser);
		expect(status).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalledTimes(1);
	});
});
