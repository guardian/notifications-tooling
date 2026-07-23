import { describe, expect, it } from 'bun:test';
import { http, passthrough } from 'msw';
import { server } from '../mocks/server';
import { proxyApiRequest } from './proxyApiRequest';

describe('proxyApiRequest', () => {
	it('forwards the request and returns the upstream response unchanged', async () => {
		let receivedRequest: unknown;
		const upstream = Bun.serve({
			port: 0,
			async fetch(request) {
				if (request.method === 'OPTIONS') {
					return new Response(null, {
						headers: {
							'Access-Control-Allow-Headers': 'content-type, x-example',
							'Access-Control-Allow-Methods': 'POST',
							'Access-Control-Allow-Origin': '*',
						},
					});
				}
				const url = new URL(request.url);
				receivedRequest = {
					method: request.method,
					path: `${url.pathname}${url.search}`,
					header: request.headers.get('x-example'),
					body: (await request.json()) as { dryRun: boolean },
				};
				return Response.json(
					{ accepted: true },
					{
						status: 202,
						headers: {
							'Access-Control-Allow-Origin': '*',
							'x-upstream': 'notifications-backend',
						},
					},
				);
			},
		});

		try {
			server.use(http.all(`${upstream.url}*`, () => passthrough()));
			const response = await proxyApiRequest(
				new Request('http://frontend.local/v1/notifications?source=example', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Example': 'forwarded',
					},
					body: JSON.stringify({ dryRun: true }),
				}),
				upstream.url.toString(),
			);

			expect(receivedRequest).toEqual({
				method: 'POST',
				path: '/v1/notifications?source=example',
				header: 'forwarded',
				body: { dryRun: true },
			});
			expect(response.status).toBe(202);
			expect(response.headers.get('x-upstream')).toBe('notifications-backend');
			expect(await response.json()).toEqual({ accepted: true });
		} finally {
			await upstream.stop(true);
		}
	});
});
