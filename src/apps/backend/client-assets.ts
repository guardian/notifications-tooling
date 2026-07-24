import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = dirname(fileURLToPath(import.meta.url));

const localFrontendDistDir = join(backendDir, '..', 'frontend', 'dist');
const localFrontendSrcDir = join(backendDir, '..', 'frontend', 'src');

const hasFileExtension = (requestPath: string): boolean =>
	/\.[^/]+$/.test(requestPath);

export const isClientAppRoutePath = (requestPath: string): boolean =>
	!hasFileExtension(requestPath);

export const clientAssetsDir = process.env.LAMBDA_TASK_ROOT
	? join(process.env.LAMBDA_TASK_ROOT, 'frontend')
	: existsSync(localFrontendDistDir)
		? localFrontendDistDir
		: localFrontendSrcDir;

export const clientIndexFile = join(clientAssetsDir, 'index.html');
