import { rateLimit } from 'express-rate-limit';

const fifteenMinutesInMilliseconds = 15 * 60 * 1000;
const maxRequestsInWindow = 500;

/**
 * Rate limits requests to the authenticated API routes to guard against abuse
 * of the authorization-performing handlers. Keyed by client IP (the default)
 * and backed by the in-process store, which is sufficient for a single-instance
 * deployment behind the load balancer.
 */
export const rateLimitMiddleware = rateLimit({
	windowMs: fifteenMinutesInMilliseconds,
	limit: maxRequestsInWindow,
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
