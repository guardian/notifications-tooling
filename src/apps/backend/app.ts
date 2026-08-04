import serverlessExpress from '@codegenie/serverless-express';
import { httpLogger } from '@http-logger';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { clientAssetsDir } from './client-assets';
import { authRedirectMiddleware } from './middleware/auth-middleware';
import { serveIndex } from './middleware/serve-index';
import { channelsRouter } from './routers/channels';
import { docsRouter } from './routers/docs';
import { healthRouter } from './routers/health';
import { notificationTestsRouter } from './routers/notification-tests';
import { notificationsRouter } from './routers/notifications';
import { userRouter } from './routers/user';

export const app: Application = express();

app.disable('x-powered-by');

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/docs/api', docsRouter);

const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

// Private - authenticated routes
app.use('/v1/channels', channelsRouter);

// Serve index.html with the current user injected as config. Handled before
// express.static (which has index serving disabled below) so the un-injected
// file is never served.
if (process.env.NODE_ENV === 'test') {
	app.get(['/', '/index.html'], serveIndex);
} else {
	app.get(['/', '/index.html'], authRedirectMiddleware, serveIndex);
}

app.use(
	express.static(clientAssetsDir, {
		index: false,
		maxAge: oneYearInMs,
		immutable: true,
	}),
);

// Private - authenticated routes
app.use('/v1/notification-tests', notificationTestsRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/v1/user', userRouter);

app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'Not Found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	req.log.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

export const handler = serverlessExpress({ app });
