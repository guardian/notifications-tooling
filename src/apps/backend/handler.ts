import serverlessExpress from '@codegenie/serverless-express';
import { env } from '../../packages/config';
import { app } from './placeholder-app';
import { logger } from './utils/logger';

const IS_RUNNING_LOCALLY = !process.env.LAMBDA_TASK_ROOT;

if (IS_RUNNING_LOCALLY) {
	app.listen(env.PORT, env.HOST, () => {
		logger.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
	});
}

export const handler = serverlessExpress({ app });
