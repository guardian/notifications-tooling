import { expect, mock } from 'bun:test';
import type { User } from '@guardian/pan-domain-node';
import type { CookieVerificationResult } from '../auth/pan-domain-authentication';

export const testUser: User = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada.lovelace@guardian.co.uk',
	avatarUrl: 'https://avatars.example.com/ada-lovelace.png',
	authenticatingSystem: 'notifications-tooling',
	authenticatedIn: ['notifications-tooling'],
	expires: Date.now() + 60 * 60 * 1000,
	multifactor: true,
};

export const verifyCookieMock = mock<
	(cookieHeader?: string) => Promise<CookieVerificationResult>
>(() => Promise.resolve({ success: false }));

export const installPandaAuthMock = (): void => {
	mock.module('../auth/pan-domain-authentication', () => ({
		verifyCookie: verifyCookieMock,
	}));
};

export const authenticateRequests = (user: User = testUser): void => {
	verifyCookieMock.mockImplementation(() =>
		Promise.resolve({ success: true, user }),
	);
};

export interface ProtectedEndpoint {
	method: string;
	path: string;
}

export const assertUnauthenticatedRequestBlocked = async (
	baseUrl: string,
	{ method, path }: ProtectedEndpoint,
): Promise<void> => {
	verifyCookieMock.mockResolvedValueOnce({ success: false });

	const response = await fetch(`${baseUrl}${path}`, {
		method,
		redirect: 'manual',
	});

	expect(response.status).toBe(401);
	expect(response.headers.get('content-type')).toContain('application/json');

	const body = (await response.json()) as {
		error: string;
		message: string;
		loginUrl: string;
	};
	expect(body.error).toBe('unauthenticated');
	expect(body.message).toBe(
		'Authentication is required to access this resource.',
	);
	expect(body.loginUrl).toContain('/login?returnUrl=');
};
