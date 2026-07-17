import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { pinoHttp } from 'pino-http';
import { docsRouter } from './routers/docs';
import { healthRouter } from './routers/health';
import { notificationsRouter } from './routers/notifications';
import { rootRouter } from './routers/root';
import { logger } from './utils/logger';

export const app: Application = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- Routes ---

app.use('/', rootRouter);
app.use('/health', healthRouter);
app.use('/v1/notifications', notificationsRouter);
app.use('/docs/api', docsRouter);

// --- 404 Handler ---
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: 'Not Found' });
});

// --- Error Handler (must have 4 args) ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
	req.log.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});
