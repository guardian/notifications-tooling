import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { env, isRunningLocally } from '@config';
import { getSSMParameter } from '@config/ssm';
import type { AppConfig } from '@models';
import type { Request, RequestHandler, Response } from 'express';
import { clientAssetsDir } from '../client-assets';
import { listUserPermissions } from '../utils/permissions/permissions-store';

const indexHtmlPath = join(clientAssetsDir, 'index.html');

/**
 * Placeholder comment in `src/index.html` that Bun passes through untouched
 * while still hashing the referenced assets. Replaced per request with the
 * injected config JSON.
 */
const configPlaceholder = '<!--APP_CONFIG-->';

let cachedTemplate: string | undefined;

const presenceHostByStage: Record<NonNullable<AppConfig['stage']>, string> = {
	DEV: 'presence.code.dev-gutools.co.uk',
	CODE: 'presence.code.dev-gutools.co.uk',
	PROD: 'presence.gutools.co.uk',
};

/**
 * Reads Bun's built `index.html` once and caches it. The file only changes at
 * build time, so there is no need to re-read it per request.
 */
const readIndexTemplate = async (): Promise<string> => {
	if (isRunningLocally) {
		return readFile(indexHtmlPath, 'utf8');
	}
	cachedTemplate ??= await readFile(indexHtmlPath, 'utf8');
	return cachedTemplate;
};

/**
 * Serves Bun's built `index.html`, injecting the page config
 * in place of the {@link configPlaceholder} so the SPA can read it
 * synchronously from `window.__APP_CONFIG__` before it mounts.
 */
export const serveIndex: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	const DISABLE_APP_SEND_TAB = await getSSMParameter('DISABLE_APP_SEND_TAB');
	const permissions = await listUserPermissions(req.user!.email);
	const presenceHost = presenceHostByStage[env.STAGE];
	const config: AppConfig = {
		user: req.user!,
		permissions,
		DISABLE_APP_SEND_TAB: DISABLE_APP_SEND_TAB.toLowerCase() === 'true',
		stage: env.STAGE,
		presence: {
			clientUrl: `https://${presenceHost}/client/1/lib.js`,
			endpoint: `wss://${presenceHost}/socket`,
		},
	};
	const html = (await readIndexTemplate()).replace(
		configPlaceholder,
		JSON.stringify(config),
	);

	res
		.status(200)
		.type('html')
		.set('Cache-Control', 'no-store, max-age=0')
		.send(html);
};
