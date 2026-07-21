import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, {
	type Application,
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { healthRouter } from './routers/health';

export const app: Application = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/health', healthRouter);

const IS_RUNNING_LOCALLY = !process.env.LAMBDA_TASK_ROOT;

const rootDir = dirname(fileURLToPath(import.meta.url));
const placeholderAssetsDir = join(
	rootDir,
	IS_RUNNING_LOCALLY ? 'placeholder-assets' : 'frontend',
);
const placeholderIndexFile = join(placeholderAssetsDir, 'index.html');

app.use(express.static(placeholderAssetsDir));

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
app.get('/', (_req: Request, res: Response, _next: NextFunction) => {
	res.sendFile(placeholderIndexFile);
});
