import { serve } from 'bun';
import { proxyApiRequest } from './api/proxyApiRequest';
import index from './index.html';

const backendBaseUrl =
	process.env.NOTIFICATIONS_BACKEND_URL ?? 'http://localhost:4000';

const server = serve({
	routes: {
		'/v1/*': (request) => proxyApiRequest(request, backendBaseUrl),
		// Serves the MSW browser worker script (see src/mocks/browser.ts). Must
		// be served from the site root so its service worker scope covers all
		// requests. Removed at Phase 6 cutover (docs/frontend-api-layer/plan.md).
		'/mockServiceWorker.js': new Response(
			Bun.file('./public/mockServiceWorker.js'),
		),
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
