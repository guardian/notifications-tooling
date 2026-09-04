import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import type { NextFunction, Request, Response } from 'express';
import type { ErrorEnvelope } from './error-envelope';
import { errorMiddleware } from './middleware/error-middleware';
import {
	authenticateRequests,
	installPandaAuthMock,
	verifyCookieMock,
} from './utils/test-utils/panda-auth';

// Stub Panda verification before the app (and its real verifier) is imported.
installPandaAuthMock();

const serveIndexMock = mock((_request: Request, response: Response) =>
	response
		.status(200)
		.type('html')
		.set('Cache-Control', 'no-store, max-age=0')
		.send('<div id="root"></div>'),
);
void mock.module('./middleware/serve-index', () => ({
	serveIndex: serveIndexMock,
}));

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
		authenticateRequests();
		server = await startTestServer();
	});

	afterAll(async () => {
		await server.close();
	});

	it('serves the 404 envelope for unmatched non-page requests', async () => {
		const response = await fetch(`${server.baseUrl}/no-such-route`, {
			method: 'POST',
		});
		const body = (await response.json()) as ErrorEnvelope;

		expect(response.status).toBe(404);
		expect(body.error).toBe('not_found');
		expect(body.message.length).toBeGreaterThan(0);
		// pino-http mints one per request and echoes it in X-Request-Id.
		expect(body.requestId).toBe(
			response.headers.get('X-Request-Id') ?? undefined,
		);
	});

	it('serves the SPA document for direct page-route requests', async () => {
		const response = await fetch(`${server.baseUrl}/create`, {
			headers: { Accept: 'text/html' },
		});

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(response.headers.get('cache-control')).toBe('no-store, max-age=0');
		expect(await response.text()).toContain('<div id="root"></div>');
	});

	it('serves the SPA document for unknown page routes', async () => {
		const response = await fetch(`${server.baseUrl}/no-such-route`);

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		expect(await response.text()).toContain('<div id="root"></div>');
	});

	it('redirects unauthenticated page-route requests to login', async () => {
		verifyCookieMock.mockResolvedValueOnce({ success: false });

		const response = await fetch(`${server.baseUrl}/create`, {
			headers: { Accept: 'text/html' },
			redirect: 'manual',
		});

		expect(response.status).toBe(302);
		const location = response.headers.get('location');
		expect(location).toContain('/login');
		expect(location).toContain(encodeURIComponent('/create'));
	});

	it('serves Swagger UI at /docs/api without redirecting', async () => {
		const response = await fetch(`${server.baseUrl}/docs/api`, {
			redirect: 'manual',
		});

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		const body = await response.text();
		expect(body).toContain('/docs/api/swagger-ui.css');
		expect(body).toContain('/docs/api/swagger-ui-bundle.js');
	});

	it('does not serve the SPA document for missing API routes', async () => {
		const response = await fetch(`${server.baseUrl}/v1/no-such-route`, {
			headers: { Accept: 'text/html' },
		});
		const body = (await response.json()) as ErrorEnvelope;

		expect(response.status).toBe(404);
		expect(body.error).toBe('not_found');
	});

	it('does not serve the SPA document for missing frontend assets', async () => {
		const response = await fetch(`${server.baseUrl}/index-stale.js`);
		const body = (await response.json()) as ErrorEnvelope;

		expect(response.status).toBe(404);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(body.error).toBe('not_found');
	});
});
