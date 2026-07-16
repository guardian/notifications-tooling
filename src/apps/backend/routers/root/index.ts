import { type Request, type Response, Router } from 'express';

export const healthHandler = (_req: Request, res: Response) => {
	res.json({ status: 'ok' });
};

export const rootRouter = Router().get('/', healthHandler);
