import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { z } from 'zod';
import { safeFetchJsonAndParse } from './client';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, readCsrfToken } from './csrf';

const originalFetch = globalThis.fetch;
const originalCookie = Object.getOwnPropertyDescriptor(
	Document.prototype,
	'cookie',
);

// happy-dom enforces the `__Host-` cookie prefix rules (Secure + https), so the
// cookie cannot be planted via `document.cookie` here. Stub the getter instead.
const stubCookie = (value: string) => {
	Object.defineProperty(document, 'cookie', {
		configurable: true,
		get: () => value,
	});
};

beforeEach(() => {
	Object.defineProperty(globalThis, 'location', {
		configurable: true,
		value: { origin: 'https://dispatch.gutools.co.uk' },
	});
	stubCookie('');
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	if (originalCookie) {
		Object.defineProperty(document, 'cookie', originalCookie);
	}
});

describe('readCsrfToken', () => {
	it('returns the token when the cookie is present', () => {
		stubCookie(`other=1; ${CSRF_COOKIE_NAME}=token-123; another=2`);
		expect(readCsrfToken()).toBe('token-123');
	});

	it('returns undefined when the cookie is absent', () => {
		stubCookie('other=1');
		expect(readCsrfToken()).toBeUndefined();
	});
});

describe('safeFetchJsonAndParse CSRF header', () => {
	const schema = z.object({ ok: z.boolean() });
	const okResponse = () =>
		new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});

	it('attaches the token header to a state-changing request', async () => {
		stubCookie(`${CSRF_COOKIE_NAME}=token-abc`);
		const fetchMock = mock(() => Promise.resolve(okResponse()));
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await safeFetchJsonAndParse(schema, '/v1/notifications', {
			method: 'POST',
		});

		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(new Headers(init.headers).get(CSRF_HEADER_NAME)).toBe('token-abc');
	});

	it('does not attach the header to a GET request', async () => {
		stubCookie(`${CSRF_COOKIE_NAME}=token-abc`);
		const fetchMock = mock(() => Promise.resolve(okResponse()));
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		await safeFetchJsonAndParse(schema, '/v1/notifications');

		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(new Headers(init.headers).has(CSRF_HEADER_NAME)).toBe(false);
	});
});
