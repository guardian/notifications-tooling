import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { UserResponse } from '@utils';
import type { Request, RequestHandler, Response } from 'express';
import { clientAssetsDir } from '../client-assets';
import { samplePermissions, sampleUser } from '../routers/user';

const indexHtmlPath = join(clientAssetsDir, 'index.html');

/**
 * Placeholder comment in `src/index.html` that Bun passes through untouched
 * while still hashing the referenced assets. Replaced per request with the
 * injected config script.
 */
const configPlaceholder = '<!--APP_CONFIG-->';

let cachedTemplate: string | undefined;

/**
 * Reads Bun's built `index.html` once and caches it. The file only changes at
 * build time, so there is no need to re-read it per request.
 */
const readIndexTemplate = (): string => {
	cachedTemplate ??= readFileSync(indexHtmlPath, 'utf8');
	return cachedTemplate;
};

/**
 * Serialises config for embedding in an inline `<script>`. Escaping `<`
 * prevents a value containing `</script>` from breaking out of the tag.
 */
const serializeConfig = (config: unknown): string =>
	JSON.stringify(config).replace(/</g, '\\u003c');

/**
 * Serves Bun's built `index.html`, injecting the current user and their
 * permissions in place of the {@link configPlaceholder} so the SPA can read it
 * synchronously from `window.__APP_CONFIG__` before it mounts. Mirrors the
 * `GET /v1/user` response shape. Currently seeds the injected data with
 * {@link sampleUser} and {@link samplePermissions}; this will use the
 * pan-domain-verified user and real permissions once they are wired in.
 */
export const serveIndex: RequestHandler = (_req: Request, res: Response) => {
	const config: UserResponse = {
		user: sampleUser,
		permissions: samplePermissions,
	};
	const script = `<script>window.__APP_CONFIG__ = ${serializeConfig(
		config,
	)};</script>`;
	const html = readIndexTemplate().replace(configPlaceholder, script);

	res.status(200)
		.type('html')
		.set('Cache-Control', 'no-cache')
		.send(html);
};
