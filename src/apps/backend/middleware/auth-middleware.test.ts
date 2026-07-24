import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { NextFunction, Request, Response } from 'express';

const isCookieValid = mock<(cookieHeader?: string) => Promise<boolean>>(
    async () => false,
);

mock.module('../auth/pan-domain-authentication', () => ({
    isCookieValid,
}));

const { authMiddleware } = await import('./auth-middleware');

const mockNextFunction = mock(() => { });

describe('auth-middleware', () => {
    afterEach(() => {
        mockNextFunction.mockReset();
        isCookieValid.mockReset();
        isCookieValid.mockImplementation(async () => false);
    });

    it('should redirect to login where no cookie is provided', async () => {
        const mockRequest = {
            header: mock((name: string) =>
                name === 'Cookie' ? undefined : undefined,
            ),
            hostname: 'notifications.local.dev-gutools.co.uk',
            originalUrl: '/v1/notifications?draft=true',
        } as unknown as Request;

        const mockResponse = {
            redirect: mock((location: string) => location),
        } as unknown as Response;

        await authMiddleware(
            mockRequest,
            mockResponse,
            mockNextFunction as unknown as NextFunction,
        );

        expect(isCookieValid).toHaveBeenCalledWith(undefined);
        expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
            expect.stringContaining(
                '/login?returnUrl=https://notifications.local.dev-gutools.co.uk/v1/notifications?draft=true',
            ),
        );
        expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should redirect to login where the cookie is invalid', async () => {
        const mockRequest = {
            header: mock((name: string) =>
                name === 'Cookie' ? 'gutoolsAuth-assym=expired-cookie' : undefined,
            ),
            hostname: 'notifications.local.dev-gutools.co.uk',
            originalUrl: '/v1/notifications?draft=true',
        } as unknown as Request;

        const mockResponse = {
            redirect: mock((location: string) => location),
        } as unknown as Response;

        isCookieValid.mockResolvedValueOnce(false);

        await authMiddleware(
            mockRequest,
            mockResponse,
            mockNextFunction as unknown as NextFunction,
        );

        expect(isCookieValid).toHaveBeenCalledWith('gutoolsAuth-assym=expired-cookie');
        expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
        expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('calls next where user is authenticated', async () => {
        const mockRequest = {
            header: mock((name: string) =>
                name === 'Cookie' ? 'gutoolsAuth-assym=valid-cookie' : undefined,
            ),
            hostname: 'notifications.local.dev-gutools.co.uk',
            originalUrl: '/v1/notifications?draft=true',
        } as unknown as Request;

        const mockResponse = {
            redirect: mock((location: string) => location),
        } as unknown as Response;

        isCookieValid.mockResolvedValueOnce(true);

        await authMiddleware(
            mockRequest,
            mockResponse,
            mockNextFunction as unknown as NextFunction,
        );

        expect(isCookieValid).toHaveBeenCalledWith('gutoolsAuth-assym=valid-cookie');
        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockNextFunction).toHaveBeenCalledTimes(1);
    });
});
