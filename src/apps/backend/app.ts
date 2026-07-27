import serverlessExpress from '@codegenie/serverless-express';
import { env } from '@config';
import { httpLogger } from '@http-logger';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { clientAssetsDir } from './client-assets';
import { authMiddleware } from './middleware/auth-middleware';
import { channelsRouter } from './routers/channels';
import { docsRouter } from './routers/docs';
import { healthRouter } from './routers/health';
import { notificationsRouter } from './routers/notifications';
import { userRouter } from './routers/user';

export const app: Application = express();

app.disable('x-powered-by');

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

app.use('/health', healthRouter);
app.use(
	express.static(clientAssetsDir, {
		maxAge: oneYearInMs,
		immutable: true,
		setHeaders: (res, filePath) => {
			if (filePath.endsWith('index.html')) {
				res.setHeader('Cache-Control', 'no-cache');
			}
		},
	}),
);

if (env.NODE_ENV !== 'test') {
	app.use(authMiddleware);
}

// Private - authenticated routes
app.use('/v1/channels', channelsRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/v1/user', userRouter);
app.use('/docs/api', docsRouter);

app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'Not Found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	req.log.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

export const handler = serverlessExpress({ app });
