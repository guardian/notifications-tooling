import { getDb } from '@database';
import { logger } from '@http-logger';
import { type Request, type Response, Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware';

export const healthHandler = (_req: Request, res: Response) => {
	res.json({ status: 'ok', uptime: process.uptime() });
};

const dbHealthHandler = async (_req: Request, res: Response) => {
	// Testing database connection
	try {
		const client = await getDb();
		await client.execute('select 1');

		logger.info('Database connection test successful');
		res.json({ status: 'ok' });
	} catch (error) {
		logger.error(error, 'Database connection test failed');
		res.json({ status: 'unhealthy' });
	}
};

export const healthRouter = Router()
	.get('/', healthHandler)
	.get('/db', authMiddleware, dbHealthHandler);
