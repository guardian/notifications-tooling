import { getSSMParameter } from '@config/ssm';
import { type Request, type Response, Router } from 'express';

export const healthHandler = async (_req: Request, res: Response) => {
	await getSSMParameter('test').then((value) => {
		console.log(`Health check SSM parameter value: ${value}`);
		res.json({
			status: 'ok',
			uptime: process.uptime(),
			ssmTestParameter: value,
		});
	});
};

export const healthRouter = Router().get('/', healthHandler);
