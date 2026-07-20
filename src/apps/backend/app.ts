import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { pinoHttp } from 'pino-http';
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

app.use('/health', healthRouter);
app.use('/v1/notifications', notificationsRouter);

const backendDir = dirname(fileURLToPath(import.meta.url));
const backendRootDir =
	basename(backendDir) === 'dist' ? dirname(backendDir) : backendDir;
const frontendDistDir = join(backendRootDir, '../frontend/dist');
const frontendIndexFile = join(frontendDistDir, 'index.html');
const hasFrontendBuild = existsSync(frontendIndexFile);

if (hasFrontendBuild) {
	app.use(express.static(frontendDistDir));
	app.get('*', (req: Request, res: Response, next: NextFunction) => {
		if (
			req.path === '/health' ||
			req.path === '/v1' ||
			req.path.startsWith('/v1/')
		) {
			return next();
		}

		res.sendFile(frontendIndexFile);
	});
} else {
	app.use('/', rootRouter);
}

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
