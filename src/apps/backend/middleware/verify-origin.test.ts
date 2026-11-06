import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { Request, Response } from 'express';
import { verifyOrigin } from './verify-origin';

// STAGE defaults to DEV in tests, so the expected origin is the local host.
const dispatchOrigin = 'https://dispatch.local.dev-gutools.co.uk';

const mockNextFunction = mock(() => undefined);

const createMockRequest = (
	method: string,
	headers: Partial<Record<'origin' | 'referer', string>> = {},
): Request =>
	({
		method,
		get: (name: string) => headers[name.toLowerCase() as 'origin' | 'referer'],
	}) as unknown as Request;

const createMockResponse = () => {
	const json = mock((body: unknown) => body);
	const status = mock(() => ({ json }));

	return { status, json, response: { status } as unknown as Response };
};

describe('verifyOrigin', () => {
	afterEach(() => {
		mockNextFunction.mockReset();
	});

	it('calls next when the Origin matches Dispatch', () => {
		const request = createMockRequest('POST', { origin: dispatchOrigin });
		const { status, response } = createMockResponse();

		verifyOrigin(request, response, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledTimes(1);
		expect(status).not.toHaveBeenCalled();
	});

	it('rejects a mutating request from another gutools subdomain', () => {
		const request = createMockRequest('POST', {
			origin: 'https://composer.gutools.co.uk',
		});
		const { status, json, response } = createMockResponse();

		verifyOrigin(request, response, mockNextFunction);

		expect(mockNextFunction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(403);
		expect((json.mock.calls[0]?.[0] as { error: string }).error).toBe(
			'origin_not_allowed',
		);
	});

	it('falls back to Referer when Origin is absent and rejects a mismatch', () => {
		const request = createMockRequest('POST', {
			referer: 'https://composer.gutools.co.uk/some/path',
		});
		const { status, response } = createMockResponse();

		verifyOrigin(request, response, mockNextFunction);

		expect(mockNextFunction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(403);
	});

	it('calls next when neither Origin nor Referer is present', () => {
		const request = createMockRequest('POST');
		const { status, response } = createMockResponse();

		verifyOrigin(request, response, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledTimes(1);
		expect(status).not.toHaveBeenCalled();
	});
});
