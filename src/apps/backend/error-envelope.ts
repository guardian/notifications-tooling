import type { Request } from 'express';

/**
 * The single error shape every non-2xx response carries, so a client only ever
 * parses one thing. See CONTEXT.md, "Error envelope".
 */
export interface ErrorEnvelope {
	error: string;
	message: string;
	requestId?: string;
}

/**
 * Only the request id is needed, and taking just that keeps this usable with
 * the narrower `Request` generics `express-zod-safe` hands its error hook.
 */
type RequestWithId = Pick<Request, 'id'>;

/**
 * `pino-http` types `req.id` as `ReqId` (`string | number | object`) even
 * though `@http-logger`'s `genReqId` always produces a string. Narrowed rather
 * than cast, so a non-string id is simply omitted instead of serialising as
 * `[object Object]`.
 */
const requestIdOf = (request: RequestWithId): string | undefined =>
	typeof request.id === 'string' ? request.id : undefined;

export const buildErrorEnvelope = (
	request: RequestWithId,
	error: string,
	message: string,
): ErrorEnvelope => ({
	error,
	message,
	requestId: requestIdOf(request),
});
