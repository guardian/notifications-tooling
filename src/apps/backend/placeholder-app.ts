import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { pinoHttp } from 'pino-http';
import { healthRouter } from './routers/health';
import { logger } from './utils/logger';

export const app: Application = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// --- Routes ---
app.use('/health', healthRouter);

const backendDir = dirname(fileURLToPath(import.meta.url));
const placeholderAssetsDir = join(backendDir, 'placeholder-assets');
const placeholderIndexFile = join(placeholderAssetsDir, 'index.html');

app.use(express.static(placeholderAssetsDir));

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
app.get('/', (_req: Request, res: Response, _next: NextFunction) => {
	res.sendFile(placeholderIndexFile);
});
