import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { Request, Response } from 'express';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../utils/auth/csrf';
import { verifyCsrfToken } from './verify-csrf';

const token = 'a-matching-token';

const mockNextFunction = mock(() => undefined);

const createMockRequest = (
	method: string,
	headers: Record<string, string> = {},
): Request =>
	({
		method,
		header: (name: string) => headers[name.toLowerCase()],
	}) as unknown as Request;

const createMockResponse = () => {
	const json = mock((body: unknown) => body);
	const status = mock(() => ({ json }));

	return { status, json, response: { status } as unknown as Response };
};

describe('verifyCsrfToken', () => {
	afterEach(() => {
		mockNextFunction.mockReset();
	});

	it('calls next when the header matches the cookie', () => {
		const request = createMockRequest('POST', {
			cookie: `${CSRF_COOKIE_NAME}=${token}`,
			[CSRF_HEADER_NAME]: token,
		});
		const { status, response } = createMockResponse();

		verifyCsrfToken(request, response, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledTimes(1);
		expect(status).not.toHaveBeenCalled();
	});

	it('rejects when the header is missing', () => {
		const request = createMockRequest('POST', {
			cookie: `${CSRF_COOKIE_NAME}=${token}`,
		});
		const { status, json, response } = createMockResponse();

		verifyCsrfToken(request, response, mockNextFunction);

		expect(mockNextFunction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(403);
		expect((json.mock.calls[0]?.[0] as { error: string }).error).toBe(
			'csrf_token_invalid',
		);
	});

	it('rejects when the cookie is missing', () => {
		const request = createMockRequest('POST', {
			[CSRF_HEADER_NAME]: token,
		});
		const { status, response } = createMockResponse();

		verifyCsrfToken(request, response, mockNextFunction);

		expect(mockNextFunction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(403);
	});

	it('rejects when the header does not match the cookie', () => {
		const request = createMockRequest('POST', {
			cookie: `${CSRF_COOKIE_NAME}=${token}`,
			[CSRF_HEADER_NAME]: 'a-different-token',
		});
		const { status, response } = createMockResponse();

		verifyCsrfToken(request, response, mockNextFunction);

		expect(mockNextFunction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(403);
	});
});
