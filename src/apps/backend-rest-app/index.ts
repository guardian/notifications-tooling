import express, { type Application, type Request, type Response, type NextFunction } from 'express';

// --- Configuration ---
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// --- App Initialization ---
const app: Application = express();

// --- Global Middleware ---
app.use(express.json());                          // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies

// Simple request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Routes ---

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', runtime: 'bun', uptime: process.uptime() });
});

// Example REST resource: /api/users
const router = express.Router();

router.get('/', (_req: Request, res: Response) => {
  res.json([{ id: 1, name: 'Ada Lovelace' }]);
});

router.get('/:id', (req: Request, res: Response) => {
  res.json({ id: Number(req.params.id), name: 'Ada Lovelace' });
});

router.post('/', (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  res.status(201).json({ id: Date.now(), name });
});

app.use('/api/users', router);

// --- 404 Handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// --- Error Handler (must have 4 args) ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- Start Server ---
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT} (Bun ${Bun.version})`);
});

export default app;