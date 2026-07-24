import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { Request, Response } from 'express';

const isCookieValid = mock<(cookieHeader?: string) => Promise<boolean>>(() =>
	Promise.resolve(false),
);

await mock.module('../auth/pan-domain-authentication', () => ({
	isCookieValid,
}));

const { authMiddleware } = await import('./auth-middleware');

const mockNextFunction = mock(() => undefined);

const createMockRequest = (cookieHeader?: string): Request =>
	({
		header: (name: string) => (name === 'Cookie' ? cookieHeader : undefined),
		hostname: 'notifications.local.dev-gutools.co.uk',
		originalUrl: '/v1/notifications?draft=true',
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
		isCookieValid.mockReset();
		isCookieValid.mockImplementation(() => Promise.resolve(false));
	});

	it('should redirect to login where no cookie is provided', async () => {
		const mockRequest = createMockRequest();
		const { redirect, response } = createMockResponse();

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(isCookieValid).toHaveBeenCalledWith(undefined);
		expect(redirect).toHaveBeenCalledTimes(1);
		expect(redirect).toHaveBeenCalledWith(
			expect.stringContaining(
				'/login?returnUrl=https://notifications.local.dev-gutools.co.uk/v1/notifications?draft=true',
			),
		);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('should redirect to login where the cookie is invalid', async () => {
		const mockRequest = createMockRequest('gutoolsAuth-assym=expired-cookie');
		const { redirect, response } = createMockResponse();

		isCookieValid.mockResolvedValueOnce(false);

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(isCookieValid).toHaveBeenCalledWith(
			'gutoolsAuth-assym=expired-cookie',
		);
		expect(redirect).toHaveBeenCalledTimes(1);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('calls next where user is authenticated', async () => {
		const mockRequest = createMockRequest('gutoolsAuth-assym=valid-cookie');
		const { redirect, response } = createMockResponse();

		isCookieValid.mockResolvedValueOnce(true);

		await authMiddleware(mockRequest, response, mockNextFunction);

		expect(isCookieValid).toHaveBeenCalledWith(
			'gutoolsAuth-assym=valid-cookie',
		);
		expect(redirect).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalledTimes(1);
	});
});
