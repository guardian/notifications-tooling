import express, { type RequestHandler } from 'express';
import { clientAssetsDir } from '../client-assets';

const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

export const staticAssetsMiddleware: RequestHandler = express.static(
	clientAssetsDir,
	{
		maxAge: oneYearInMs,
		immutable: true,
		setHeaders: (res, filePath) => {
			if (filePath.endsWith('index.html')) {
				res.setHeader('Cache-Control', 'no-cache');
			}
		},
	},
);
