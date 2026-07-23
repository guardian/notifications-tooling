import { randomUUID } from 'node:crypto';
import type { GenReqId } from 'pino-http';

/**
 * Generates a request id for `pino-http`.
 *
 * Reuses an incoming `x-request-id` header when present (taking the first
 * value if the header is repeated), otherwise falls back to a random UUID.
 * The resulting id is echoed back in the `X-Request-Id` response header and
 * is always returned as a string.
 */
export const genReqId: GenReqId = (req, res) => {
	const existing = req.headers['x-request-id'];
	const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
	res.setHeader('X-Request-Id', id);
	return id; // always a string
};
