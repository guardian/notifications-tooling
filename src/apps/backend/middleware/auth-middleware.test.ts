import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { Request, Response } from 'express';
import type { CookieVerificationResult } from '../utils/auth/pan-domain-authentication';
import { buildTestUser } from '../utils/test-utils/panda-auth';

const verifyCookie = mock<
	(cookieHeader?: string) => Promise<CookieVerificationResult>
>(() => Promise.resolve({ success: false }));

await mock.module('../utils/auth/pan-domain-authentication', () => ({
	verifyCookie,
}));

const { authMiddleware, authRedirectMiddleware } =
	await import('./auth-middleware');

const sampleUser = buildTestUser();

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

	it('should respond with 401 and a login url carrying no returnUrl', async () => {
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
		// `originalUrl` here is an API path, so returning a logged-in user to it
		// would land them on raw JSON rather than the SPA. The browser appends
		// its own. See docs/ADRs/login-redirect-ownership.md.
		expect(body.loginUrl).toContain('/login');
		expect(body.loginUrl).not.toContain('returnUrl');
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

describe('authRedirectMiddleware', () => {
	afterEach(() => {
		mockNextFunction.mockReset();
		verifyCookie.mockReset();
		verifyCookie.mockImplementation(() => Promise.resolve({ success: false }));
	});

	/**
	 * The counterpart to the `authMiddleware` case above: this middleware guards
	 * a document navigation, so `originalUrl` *is* the page the user asked for
	 * and the returnUrl must be kept. The two callers share `getLoginUrl` and
	 * need opposite things from it, so this pins the asymmetry.
	 */
	it('redirects to a login url that returns the user to the requested page', async () => {
		const mockRequest = {
			header: () => undefined,
			hostname: 'dispatch.test.dev-gutools.co.uk',
			originalUrl: '/',
		} as unknown as Request;
		const redirect = mock((url: string) => url);
		const response = { redirect } as unknown as Response;

		await authRedirectMiddleware(mockRequest, response, mockNextFunction);

		expect(redirect).toHaveBeenCalledTimes(1);
		const redirectUrl = redirect.mock.calls[0]?.[0] as string;
		expect(redirectUrl).toContain(
			'returnUrl=https%3A%2F%2Fdispatch.test.dev-gutools.co.uk%2F',
		);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});
});
