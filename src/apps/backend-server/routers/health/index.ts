import { Router, type Request, type Response } from 'express';

export const healthHandler = (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
};

export default Router().get('/', healthHandler);
