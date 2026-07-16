import { env } from '@config';
import pino from 'pino';

const isProduction = env.NODE_ENV === 'production';

// Paths to redact from logs to avoid leaking secrets (cookies, auth tokens, etc.).
// Covers both the shapes produced by pino-http (req/res serializers) and plain objects.
const redactPaths = [
	'req.headers.cookie',
	'req.headers.authorization',
	'req.headers["set-cookie"]',
	'req.headers["proxy-authorization"]',
	'req.headers["x-api-key"]',
	'res.headers["set-cookie"]',
	'headers.cookie',
	'headers.authorization',
	'headers["set-cookie"]',
	'headers["proxy-authorization"]',
	'headers["x-api-key"]',
	'cookie',
	'cookies',
	'authorization',
	'password',
	'token',
	'accessToken',
	'refreshToken',
	'secret',
	'apiKey',
];

export const logger = pino({
	level: env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
	redact: {
		paths: redactPaths,
		censor: '[REDACTED]',
	},
	// Pretty, colorized output in development; structured JSON in production.
	transport: isProduction
		? undefined
		: {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:HH:MM:ss.l',
					ignore: 'pid,hostname',
				},
			},
});
