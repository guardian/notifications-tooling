import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import healthCheckRouter from './routers/health';
import notificationsRouter from './routers/notifications';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Routes ---

app.use('/v1/health', healthCheckRouter);
app.use('/v1/notifications', notificationsRouter);

// --- 404 Handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// --- Error Handler (must have 4 args) ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;