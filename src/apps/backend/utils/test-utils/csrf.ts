import type { RequestHandler } from 'express';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '../auth/csrf';

/** A fixed token for tests; the double-submit guard only checks cookie==header. */
export const TEST_CSRF_TOKEN = 'test-csrf-token';

/**
 * Express middleware that stamps every request with a matching CSRF cookie and
 * header, so a suite exercising the router over HTTP satisfies the double-submit
 * guard without threading the token through each request.
 */
export const injectTestCsrf: RequestHandler = (req, _res, next) => {
	req.headers.cookie = `${CSRF_COOKIE_NAME}=${TEST_CSRF_TOKEN}`;
	req.headers[CSRF_HEADER_NAME] = TEST_CSRF_TOKEN;
	next();
};
