import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger';
import { healthRouter } from './routers/health';

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
app.get('*', (_req: Request, res: Response, _next: NextFunction) => {
	res.sendFile(placeholderIndexFile);
});
