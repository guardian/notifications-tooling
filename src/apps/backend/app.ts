import { httpLogger } from '@http-logger';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { channelsRouter } from './routers/channels';
import { docsRouter } from './routers/docs';
import { healthRouter } from './routers/health';
import { notificationsRouter } from './routers/notifications';
import { rootRouter } from './routers/root';
import { userRouter } from './routers/user';

export const app: Application = express();

app.disable('x-powered-by');

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', rootRouter);
app.use('/health', healthRouter);
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
