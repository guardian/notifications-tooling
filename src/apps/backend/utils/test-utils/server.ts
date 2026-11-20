import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import express, { type Application } from 'express';
import { app } from '../../app';
import { injectTestCsrf } from './csrf';

/** A running test server plus the helpers needed to talk to and stop it. */
export interface TestServer {
	baseUrl: string;
	close: () => Promise<void>;
}

/**
 * Starts the Express `app` on an ephemeral port so handler tests exercise the
 * full middleware chain over real HTTP. Pair with `close` in an `afterAll`.
 *
 * Requests are stamped with a matching CSRF token first, so suites satisfy the
 * double-submit guard without threading the token through every call; the guard
 * itself is covered directly in `verify-csrf.test.ts`.
 */
export const startTestServer = async (
	application: Application = app,
): Promise<TestServer> => {
	const harness = express();
	harness.use(injectTestCsrf);
	harness.use(application);

	const server: Server = harness.listen(0);
	await new Promise<void>((resolve) => server.once('listening', resolve));

	const { port } = server.address() as AddressInfo;

	return {
		baseUrl: `http://127.0.0.1:${port}`,
		close: () =>
			new Promise<void>((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
			}),
	};
};
