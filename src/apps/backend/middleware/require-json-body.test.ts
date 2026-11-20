import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { Request, Response } from 'express';
import { requireJsonBody } from './require-json-body';

const mockNextFunction = mock(() => undefined);

const createMockRequest = (isJson: boolean): Request =>
	({
		method: 'POST',
		header: () => undefined,
		is: (type: string) =>
			isJson && type === 'application/json' ? type : false,
	}) as unknown as Request;

const createMockResponse = () => {
	const json = mock((body: unknown) => body);
	const status = mock(() => ({ json }));

	return { status, json, response: { status } as unknown as Response };
};

describe('requireJsonBody', () => {
	afterEach(() => {
		mockNextFunction.mockReset();
	});

	it('calls next for a JSON body', () => {
		const { status, response } = createMockResponse();

		requireJsonBody(createMockRequest(true), response, mockNextFunction);

		expect(mockNextFunction).toHaveBeenCalledTimes(1);
		expect(status).not.toHaveBeenCalled();
	});

	it('rejects a non-JSON body with 415', () => {
		const { status, json, response } = createMockResponse();

		requireJsonBody(createMockRequest(false), response, mockNextFunction);

		expect(mockNextFunction).not.toHaveBeenCalled();
		expect(status).toHaveBeenCalledWith(415);
		expect((json.mock.calls[0]?.[0] as { error: string }).error).toBe(
			'unsupported_media_type',
		);
	});
});
