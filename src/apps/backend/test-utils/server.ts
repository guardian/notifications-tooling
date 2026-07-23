import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../app';

/** A running test server plus the helpers needed to talk to and stop it. */
export interface TestServer {
	baseUrl: string;
	close: () => Promise<void>;
}

/**
 * Starts the Express `app` on an ephemeral port so handler tests exercise the
 * full middleware chain over real HTTP. Pair with `close` in an `afterAll`.
 */
export const startTestServer = async (): Promise<TestServer> => {
	const server: Server = app.listen(0);
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
