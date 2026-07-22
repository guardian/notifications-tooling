import { env } from '@config';
import { app } from './app';
import { logger } from './utils/logger';

app.listen(env.PORT, env.HOST, () => {
	logger.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
});
