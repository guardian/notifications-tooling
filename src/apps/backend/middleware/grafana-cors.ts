import { env } from '@config';
import type { RequestHandler } from 'express';

const grafanaOriginByStage = {
	CODE: 'https://metrics.code.dev-gutools.co.uk',
	PROD: 'https://metrics.gutools.co.uk',
	DEV: '',
} as const;

const allowedGrafanaOrigin = grafanaOriginByStage[env.STAGE];

export const grafanaCorsMiddleware: RequestHandler = (
	request,
	response,
	next,
) => {
	const origin = request.header('Origin');
	if (origin !== allowedGrafanaOrigin) {
		return next();
	}

	response.setHeader('Access-Control-Allow-Origin', origin);
	response.setHeader('Access-Control-Allow-Credentials', 'true');
	response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	response.setHeader('Vary', 'Origin');

	if (request.method === 'OPTIONS') {
		return response.sendStatus(204);
	}

	return next();
};
