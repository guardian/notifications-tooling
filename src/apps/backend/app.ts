import serverlessExpress from '@codegenie/serverless-express';
import { httpLogger } from '@http-logger';
import express, {
	type Application,
	type Request,
	type Response,
} from 'express';
import { clientAssetsDir } from './client-assets';
import { buildErrorEnvelope } from './error-envelope';
import { authRedirectMiddleware } from './middleware/auth-middleware';
import { errorMiddleware } from './middleware/error-middleware';
import { serveIndex } from './middleware/serve-index';
import { channelsRouter } from './routers/channels';
import { contentRouter } from './routers/content';
import { docsRouter } from './routers/docs';
import { healthRouter } from './routers/health';
import { notificationTestsRouter } from './routers/notification-tests';
import { notificationsRouter } from './routers/notifications';
import { previewRouter } from './routers/preview';
import { userRouter } from './routers/user';

export const app: Application = express();

app.disable('x-powered-by');

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);

const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

// Serve index.html with the current user injected as config. Handled before
// express.static (which has index serving disabled below) so the un-injected
// file is never served.
if (process.env.NODE_ENV === 'test') {
	app.get(['/', '/index.html'], serveIndex);
} else {
	app.use(authRedirectMiddleware).get(['/', '/index.html'], serveIndex);
}

app.use(
	express.static(clientAssetsDir, {
		index: false,
		maxAge: oneYearInMs,
		immutable: true,
	}),
);

// Private - authenticated routes
app.use('/docs/api', docsRouter);
app.use('/v1/channels', channelsRouter);
app.use('/v1/content', contentRouter);
app.use('/v1/notification-tests', notificationTestsRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/v1/user', userRouter);
app.use('/v1/preview', previewRouter);

const serverRoutePrefixes = ['/health', '/v1', '/docs/api'];

/**
 * Browser-history routes are resolved by React Router, but a direct request
 * must first receive the SPA document. Skip server-owned namespaces so missing
 * backend routes still receive the normal error envelope.
 */
const spaFallback: express.RequestHandler = (req, res, next) => {
	const isServerRoute = serverRoutePrefixes.some(
		(prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
	);

	if (isServerRoute) {
		return next('route');
	}

	return next();
};

app.get('*splat', spaFallback, authRedirectMiddleware, serveIndex);

/**
 * The catch-all 404 and 500 responses use the same
 * `{ error, message, requestId }` envelope as the notifications router's
 * 400/422, so a client only ever parses one error shape.
 */
export const notFoundHandler = (req: Request, res: Response) => {
	res
		.status(404)
		.json(
			buildErrorEnvelope(
				req,
				'not_found',
				'The requested resource does not exist.',
			),
		);
};

app.use(notFoundHandler);
app.use(errorMiddleware);

export const handler = serverlessExpress({ app });
