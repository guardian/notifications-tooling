import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { app } from '../app';

/** A running test server plus the helpers needed to talk to and stop it. */
export interface TestServer {
	/** Base URL (e.g. `http://127.0.0.1:54321`) the app is listening on. */
	baseUrl: string;
	/** Stops the server, resolving once the port is released. */
	close: () => Promise<void>;
}

/**
 * Starts the Express `app` on an ephemeral port so handler tests can exercise
 * the full middleware chain over real HTTP. Pair with {@link TestServer.close}
 * in an `afterAll` hook.
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
