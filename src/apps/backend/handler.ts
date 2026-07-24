import serverlessExpress from '@codegenie/serverless-express';
import { env } from '../../packages/config';
import { app } from './placeholder-app';

const IS_RUNNING_LOCALLY = !process.env.LAMBDA_TASK_ROOT;

if (IS_RUNNING_LOCALLY) {
	app.listen(env.PORT, env.HOST, () => {});
}

export const handler = serverlessExpress({ app });
