import { type HttpLogger, pinoHttp } from 'pino-http';
import { genReqId } from './gen-req-id';
import { logger } from './logger';

/**
 * Express middleware that attaches a child `logger` to each request as
 * `req.log`, using {@link genReqId} to assign a stable request id.
 */
export const httpLogger: HttpLogger = pinoHttp({ logger, genReqId });
