import { expect, mock } from 'bun:test';
import type { User } from '@guardian/pan-domain-node';
import type { CookieVerificationResult } from '../auth/pan-domain-authentication';

/** A stand-in Panda user for authenticated-path tests. */
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

/**
 * Stubbed cookie verifier. Defaults to failing (i.e. unauthenticated) and,
 * being a `mock`, stands in for the real pan-domain-node client so tests never
 * make AWS/S3 calls.
 */
export const verifyCookieMock = mock<
	(cookieHeader?: string) => Promise<CookieVerificationResult>
>(() => Promise.resolve({ success: false }));

/**
 * Swaps the real `verifyCookie` for {@link verifyCookieMock}. Must be called at
 * module top-level BEFORE the Express `app` is imported (import the app
 * dynamically afterwards) so `authMiddleware` wires up the stub rather than the
 * real verifier.
 */
export const installPandaAuthMock = (): void => {
	mock.module('../auth/pan-domain-authentication', () => ({
		verifyCookie: verifyCookieMock,
	}));
};

/**
 * Makes every subsequent cookie check succeed as {@link testUser} (or a
 * supplied user), so requests reach their handler. Call from a router test's
 * `beforeAll`/`beforeEach` to exercise the authenticated path.
 */
export const authenticateRequests = (user: User = testUser): void => {
	verifyCookieMock.mockImplementation(() =>
		Promise.resolve({ success: true, user }),
	);
};

/** An HTTP endpoint mounted under the authenticated `/v1` namespace. */
export interface ProtectedEndpoint {
	method: string;
	path: string;
}

/**
 * Asserts an unauthenticated request to a protected `/v1` endpoint is stopped by
 * `authMiddleware`: it must redirect (302) to the login host instead of reaching
 * the handler. Forces the next cookie check to fail regardless of the ambient
 * default, and handles the redirect manually so the assertion never follows the
 * 302 out to the (unreachable) login service.
 */
export const assertUnauthenticatedRequestBlocked = async (
	baseUrl: string,
	{ method, path }: ProtectedEndpoint,
): Promise<void> => {
	verifyCookieMock.mockResolvedValueOnce({ success: false });

	const response = await fetch(`${baseUrl}${path}`, {
		method,
		redirect: 'manual',
	});

	expect(response.status).toBe(302);
	expect(response.headers.get('location')).toContain('/login?returnUrl=');
};
