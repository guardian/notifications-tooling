import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, {
	type Application,
	type Request,
	type Response,
} from 'express';
import { authMiddleware } from './middleware/auth-middleware';
import { healthRouter } from './routers/health';

export const app: Application = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/health', healthRouter);

const backendDir = dirname(fileURLToPath(import.meta.url));
const placeholderAssetsDir = !process.env.LAMBDA_TASK_ROOT
	? join(backendDir, 'placeholder-assets')
	: join(process.env.LAMBDA_TASK_ROOT, 'frontend');
const placeholderIndexFile = join(placeholderAssetsDir, 'index.html');

app.get('/', authMiddleware, (_req: Request, res: Response) => {
	res.sendFile(placeholderIndexFile);
});

app.use(express.static(placeholderAssetsDir));
