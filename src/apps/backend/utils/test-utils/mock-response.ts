import { mock } from 'bun:test';
import type { Response } from 'express';
import type { ErrorEnvelope } from '../../error-envelope';

/**
 * A stand-in for Express's `Response` that records `status(...)` and `json(...)`
 * so a handler can be driven directly, without an HTTP round trip. `envelope()`
 * reads back the body as the shared error shape.
 */
export const createMockResponse = () => {
	const redirect = mock((location: string) => location);
	const json = mock<(body: unknown) => unknown>((body) => body);
	const status = mock(() => ({ json }));

	return {
		redirect,
		status,
		response: { redirect, status, json } as unknown as Response,
		envelope: <Envelope extends ErrorEnvelope = ErrorEnvelope>() =>
			json.mock.calls[0]?.[0] as Envelope,
	};
};
