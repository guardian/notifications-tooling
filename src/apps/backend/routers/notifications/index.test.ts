import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { startTestServer, type TestServer } from '../../test-utils/server';

/**
 * These tests drive the real Express app over HTTP so the whole `POST
 * /v1/notifications` chain runs: `express.json()` -> the `express-zod-safe`
 * `validate` middleware -> our error hook -> the 202 handler.
 */

let server: TestServer;
let baseUrl: string;

beforeAll(async () => {
	server = await startTestServer();
	baseUrl = server.baseUrl;
});

afterAll(async () => {
	await server.close();
});

const postNotification = (body: unknown): Promise<Response> =>
	fetch(`${baseUrl}/v1/notifications`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});

/** A minimal, fully valid single-channel app-push request. */
const validPushRequest = () => ({
	idempotencyKey: 'push-2026-07-08',
	category: 'editorial',
	sender: 'notifications-tooling-spa/v1',
	content: {
		items: {
			lead: {
				type: 'app-push-notification',
				title: 'Ukraine summit begins',
				body: 'World leaders gather in Geneva as talks open.',
				link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
			},
		},
	},
	channels: [
		{
			channel: 'app-push-notification',
			audience: { type: 'topic', topics: [{ type: 'breaking', name: 'uk' }] },
			compose: { use: 'lead' },
		},
	],
});

describe('POST /v1/notifications', () => {
	describe('happy path', () => {
		it('accepts a valid request with 202 and the acceptance envelope', async () => {
			const response = await postNotification(validPushRequest());

			expect(response.status).toBe(202);

			const body = (await response.json()) as {
				notificationId: string;
				status: string;
				plans: Array<{ channel: string; planId: string; status: string }>;
				statusUrl: string;
				cancellable: { cancelUrl: string; expiresAt: number };
			};

			expect(body.status).toBe('accepted');
			expect(typeof body.notificationId).toBe('string');
			expect(body.notificationId.length).toBeGreaterThan(0);

			expect(body.plans).toEqual([
				{
					channel: 'app-push-notification',
					planId: `${body.notificationId}#app-push-notification`,
					status: 'accepted',
				},
			]);

			expect(body.statusUrl).toBe(
				`/v1/notifications/${body.notificationId}/status`,
			);
			expect(body.cancellable.cancelUrl).toBe(
				`/v1/notifications/${body.notificationId}/cancel`,
			);
			expect(typeof body.cancellable.expiresAt).toBe('number');
		});
	});

	describe('400 bad_request (structural failures)', () => {
		it('rejects a body missing a required field', async () => {
			const { idempotencyKey, ...withoutKey } = validPushRequest();
			void idempotencyKey;

			const response = await postNotification(withoutKey);

			expect(response.status).toBe(400);

			const body = (await response.json()) as {
				error: string;
				details: Array<{ code: string; path: string; message: string }>;
			};

			expect(body.error).toBe('bad_request');
			expect(
				body.details.some((detail) => detail.path === '/idempotencyKey'),
			).toBe(true);
		});

		it('rejects an unknown channel discriminator', async () => {
			const request = validPushRequest() as unknown as {
				channels: Array<{ channel: string }>;
			};
			request.channels[0]!.channel = 'telegram';

			const response = await postNotification(request);

			expect(response.status).toBe(400);

			const body = (await response.json()) as { error: string };
			expect(body.error).toBe('bad_request');
		});
	});

	describe('422 validation_failed (semantic/business failures)', () => {
		it('rejects a title that exceeds the push length limit', async () => {
			const request = validPushRequest();
			request.content.items.lead.title = 'x'.repeat(200);

			const response = await postNotification(request);

			expect(response.status).toBe(422);

			const body = (await response.json()) as {
				error: string;
				details: Array<{ code: string; path: string; message: string }>;
			};

			expect(body.error).toBe('validation_failed');
			expect(
				body.details.some(
					(detail) => detail.path === '/content/items/lead/title',
				),
			).toBe(true);
		});

		it('rejects a compose that references an unknown content item', async () => {
			const request = validPushRequest();
			request.channels[0]!.compose.use = 'missing';

			const response = await postNotification(request);

			expect(response.status).toBe(422);

			const body = (await response.json()) as { error: string };
			expect(body.error).toBe('validation_failed');
		});

		it('rejects a non-Guardian article link', async () => {
			const request = validPushRequest();
			request.content.items.lead.link = 'https://evil.example.com/story';

			const response = await postNotification(request);

			expect(response.status).toBe(422);

			const body = (await response.json()) as { error: string };
			expect(body.error).toBe('validation_failed');
		});
	});
});
