import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { User } from '@guardian/pan-domain-node';
import type { Request, Response } from 'express';
import type { CookieVerificationResult } from '../auth/pan-domain-authentication';

const verifyCookie = mock<
	(cookieHeader?: string) => Promise<CookieVerificationResult>
>(() => Promise.resolve({ success: false }));

await mock.module('../auth/pan-domain-authentication', () => ({
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
	const redirect = mock((location: string) => location);

	return {
		redirect,
		response: {
			redirect,
		} as unknown as Response,
	};
};

describe('auth-middleware', () => {
	afterEach(() => {
		mockNextFunction.mockReset();
		verifyCookie.mockReset();
		verifyCookie.mockImplementation(() => Promise.resolve({ success: false }));
	});

	it('should redirect to login where no cookie is provided', async () => {
		const mockRequest = createMockRequest();
		const { redirect, response } = createMockResponse();

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(verifyCookie).toHaveBeenCalledWith(undefined);
		expect(redirect).toHaveBeenCalledTimes(1);
		expect(redirect).toHaveBeenCalledWith(
			expect.stringContaining(
				'/login?returnUrl=https://dispatch.test.dev-gutools.co.uk/v1/notifications',
			),
		);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('should redirect to login where the cookie is invalid', async () => {
		const mockRequest = createMockRequest('gutoolsAuth-assym=expired-cookie');
		const { redirect, response } = createMockResponse();

		verifyCookie.mockResolvedValueOnce({ success: false });

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(verifyCookie).toHaveBeenCalledWith(
			'gutoolsAuth-assym=expired-cookie',
		);
		expect(redirect).toHaveBeenCalledTimes(1);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('calls next and injects the user where authenticated', async () => {
		const mockRequest = createMockRequest('gutoolsAuth-assym=valid-cookie');
		const { redirect, response } = createMockResponse();

		verifyCookie.mockResolvedValueOnce({ success: true, user: sampleUser });

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(verifyCookie).toHaveBeenCalledWith('gutoolsAuth-assym=valid-cookie');
		expect(mockRequest.user).toEqual(sampleUser);
		expect(redirect).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalledTimes(1);
	});
});
