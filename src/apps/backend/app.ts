import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { pinoHttp } from "pino-http";
import healthCheckRouter from "./routers/health";
import notificationsRouter from "./routers/notifications";
import rootRouter from "./routers/root";
import { logger } from "./utils/logger";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(pinoHttp({ logger }));

// --- Routes ---

app.use("/", rootRouter);
app.use("/v1/health", healthCheckRouter);
app.use("/v1/notifications", notificationsRouter);

// --- 404 Handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// --- Error Handler (must have 4 args) ---
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.log.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
