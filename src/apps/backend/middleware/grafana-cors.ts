import cors from 'cors';
import type { RequestHandler } from 'express';

const allowedGrafanaOrigins = [
	'https://grafana.local.dev-gutools.co.uk',
	'https://metrics.gutools.co.uk',
	'https://public.metrics.gutools.co.uk',
];

export const grafanaCorsMiddleware: RequestHandler = cors({
	origin: allowedGrafanaOrigins,
	credentials: true,
});
