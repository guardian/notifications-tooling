import { afterAll, afterEach, beforeAll } from 'bun:test';
import { server } from './server';

/**
 * Global MSW lifecycle for `bun test`, loaded via the `bunfig.toml` test
 * preload so every test file shares one server instance. Individual tests
 * add routes with `server.use(...)`; `resetHandlers` clears those after
 * each test so they don't leak between files.
 */
beforeAll(() => {
	server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
	server.resetHandlers();
});

afterAll(() => {
	server.close();
});
