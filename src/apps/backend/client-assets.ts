import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = dirname(fileURLToPath(import.meta.url));

const localFrontendDistDir = join(backendDir, '..', 'frontend', 'dist');

export const clientAssetsDir = process.env.LAMBDA_TASK_ROOT
	? join(process.env.LAMBDA_TASK_ROOT, 'frontend')
	: localFrontendDistDir;
