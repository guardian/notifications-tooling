import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';

/**
 * Double-submit CSRF token plumbing. The token is issued as a host-locked,
 * JS-readable cookie and must be echoed back in a request header on every
 * state-changing call; the guard checks the two match. A cross-origin attacker
 * (including another `*.gutools.co.uk` host) cannot read this host-scoped
 * cookie, so it cannot forge the matching header — which is what the shared
 * pan-domain auth cookie alone cannot prevent.
 */

/**
 * The `__Host-` prefix forces Secure + Path=/ + no Domain, which locks the
 * cookie to this exact host. A sibling `*.gutools.co.uk` therefore cannot set
 * or overwrite it, closing the classic double-submit subdomain weakness.
 */
export const CSRF_COOKIE_NAME = '__Host-dispatch-csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

const generateToken = (): string => randomBytes(32).toString('base64url');

/** Issues a fresh token cookie on the response. */
export const issueCsrfCookie = (response: Response): void => {
	response.cookie(CSRF_COOKIE_NAME, generateToken(), {
		secure: true,
		path: '/',
		sameSite: 'strict',
		httpOnly: false, // the SPA must read it to echo it back in the header
	});
};

const readCookie = (
	cookieHeader: string | undefined,
	name: string,
): string | undefined => {
	if (!cookieHeader) {
		return undefined;
	}
	for (const part of cookieHeader.split(';')) {
		const separator = part.indexOf('=');
		if (separator === -1) {
			continue;
		}
		if (part.slice(0, separator).trim() === name) {
			return part.slice(separator + 1).trim();
		}
	}
	return undefined;
};

const constantTimeEquals = (a: string, b: string): boolean => {
	const aBytes = Buffer.from(a);
	const bBytes = Buffer.from(b);
	return aBytes.length === bBytes.length && timingSafeEqual(aBytes, bBytes);
};

/** True when the request's token header matches its token cookie. */
export const hasValidCsrfToken = (
	cookieHeader: string | undefined,
	headerToken: string | undefined,
): boolean => {
	if (!headerToken) {
		return false;
	}
	const cookieToken = readCookie(cookieHeader, CSRF_COOKIE_NAME);
	if (!cookieToken) {
		return false;
	}
	return constantTimeEquals(cookieToken, headerToken);
};
