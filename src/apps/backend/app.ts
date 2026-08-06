import serverlessExpress from '@codegenie/serverless-express';
import { httpLogger } from '@http-logger';
import express, {
	type Application,
	type Request,
	type Response,
} from 'express';
import { clientAssetsDir } from './client-assets';
import { authRedirectMiddleware } from './middleware/auth-middleware';
import { errorMiddleware } from './middleware/error-middleware';
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
app.use('/v1/channels', channelsRouter);
app.use('/v1/notification-tests', notificationTestsRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/v1/user', userRouter);
app.use('/docs/api', docsRouter);

app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'Not Found' });
});

app.use(errorMiddleware);

export const handler = serverlessExpress({ app });
