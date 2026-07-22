import { env } from '@config';
import { logger } from '@http-logger';
import { app } from './app';

app.listen(env.PORT, env.HOST, () => {
	logger.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
});
