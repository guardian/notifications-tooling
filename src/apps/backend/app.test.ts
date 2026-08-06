import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import type { NextFunction, Request, Response } from 'express';
import type { ErrorEnvelope } from './error-envelope';
import { errorMiddleware } from './middleware/error-middleware';
import { installPandaAuthMock } from './utils/test-utils/panda-auth';

// Stub Panda verification before the app (and its real verifier) is imported.
installPandaAuthMock();

const { notFoundHandler } = await import('./app');
const { startTestServer } = await import('./utils/test-utils/server');
type TestServer = Awaited<ReturnType<typeof startTestServer>>;

const createMockRequest = () =>
	({
		id: 'req-test-id',
		log: { error: mock(() => undefined) },
	}) as unknown as Request;

const createMockResponse = () => {
	const json = mock((body: unknown) => body);
	const status = mock(() => ({ json }));

	return {
		status,
		response: {
			status,
		} as unknown as Response,
		envelope: () => json.mock.calls[0]?.[0] as ErrorEnvelope,
	};
};

/**
 * Both handlers emit the same `{ error, message, requestId }` envelope the
 * notifications router returns on 400/422, so a client only ever parses one
 * error shape.
 */
describe('notFoundHandler', () => {
	it('responds 404 with the shared error envelope', () => {
		const { status, response, envelope } = createMockResponse();

		notFoundHandler(createMockRequest(), response);

		expect(status).toHaveBeenCalledWith(404);
		expect(envelope().error).toBe('not_found');
		expect(envelope().message.length).toBeGreaterThan(0);
		expect(envelope().requestId).toBe('req-test-id');
	});
});

describe('errorMiddleware', () => {
	it('responds 500 with the shared error envelope and logs the cause', () => {
		const { status, response, envelope } = createMockResponse();
		const request = createMockRequest();
		const cause = new Error('boom');

		errorMiddleware(cause, request, response, (() => {}) as NextFunction);

		expect(request.log.error).toHaveBeenCalledWith(cause);
		expect(status).toHaveBeenCalledWith(500);
		expect(envelope().error).toBe('internal_error');
		expect(envelope().message.length).toBeGreaterThan(0);
		expect(envelope().requestId).toBe('req-test-id');
	});
});

describe('unmatched routes over HTTP', () => {
	let server: TestServer;

	beforeAll(async () => {
		server = await startTestServer();
	});

	afterAll(async () => {
		await server.close();
	});

	it('serves the 404 envelope with a real requestId', async () => {
		const response = await fetch(`${server.baseUrl}/no-such-route`);
		const body = (await response.json()) as ErrorEnvelope;

		expect(response.status).toBe(404);
		expect(body.error).toBe('not_found');
		expect(body.message.length).toBeGreaterThan(0);
		// pino-http mints one per request and echoes it in X-Request-Id.
		expect(body.requestId).toBe(
			response.headers.get('X-Request-Id') ?? undefined,
		);
	});
});
