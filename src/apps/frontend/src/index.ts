import { serve } from 'bun';
import { buildConfig } from './frontend-config';
import index from './index.html';

const server = serve({
	routes: {
		'/config': (req) => {
			const { NODE_ENV, STAGE, BACKEND_URI } = process.env;
			return Response.json(
				buildConfig({ BACKEND_URI, STAGE, NODE_ENV }, req.url),
			);
		},
		// Serve index.html for all unmatched routes.
		'/*': index,
	},

	development: process.env.NODE_ENV !== 'production' && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
