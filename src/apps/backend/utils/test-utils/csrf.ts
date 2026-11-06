import type { RequestHandler } from 'express';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../auth/csrf';

/** A fixed token for tests; the double-submit guard only checks cookie==header. */
export const TEST_CSRF_TOKEN = 'test-csrf-token';

/**
 * Express middleware that adds a matching CSRF cookie and header, so a suite
 * exercising the router over HTTP satisfies the double-submit guard without
 * threading the token through each request. Skipped when the test sets its own
 * `x-csrf-token`, so the guard's rejection path stays testable end to end.
 */
export const injectTestCsrf: RequestHandler = (req, _res, next) => {
	if (req.headers[CSRF_HEADER_NAME] === undefined) {
		const csrfCookie = `${CSRF_COOKIE_NAME}=${TEST_CSRF_TOKEN}`;
		req.headers.cookie = req.headers.cookie
			? `${req.headers.cookie}; ${csrfCookie}`
			: csrfCookie;
		req.headers[CSRF_HEADER_NAME] = TEST_CSRF_TOKEN;
	}
	next();
};
