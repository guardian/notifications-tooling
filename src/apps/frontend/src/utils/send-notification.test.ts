import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	mock,
} from 'bun:test';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from '../schemas';
import { sendNotification } from './send-notification';

const originalFetch = globalThis.fetch;
const originalLocation = Object.getOwnPropertyDescriptor(
	globalThis,
	'location',
);

beforeAll(() => {
	Object.defineProperty(globalThis, 'location', {
		configurable: true,
		value: { origin: 'http://localhost:3000' },
	});
});

afterEach(() => {
	globalThis.fetch = originalFetch;
});

afterAll(() => {
	if (originalLocation) {
		Object.defineProperty(globalThis, 'location', originalLocation);
	} else {
		Reflect.deleteProperty(globalThis, 'location');
	}
});

const request = {} as SendNotificationRequest;

const failedNotification: SendNotificationResponse = {
	id: 'notification-123',
	idempotencyKey: 'idempotency-123',
	kind: 'send',
	status: 'failed',
	sender: 'notifications-tooling-spa/v1',
	createdByEmail: 'editor@guardian.co.uk',
	dryRun: false,
	scheduledFor: null,
	content: {},
	channels: {},
	createdAt: '2026-09-08T10:00:00.000Z',
	updatedAt: '2026-09-08T10:00:01.000Z',
	dispatches: [
		{
			id: 'dispatch-123',
			channel: 'app-push',
			requested: {
				channel: 'app-push',
				topicType: 'breaking-news',
				editions: ['uk'],
			},
			resolved: {
				channel: 'app-push',
				topics: [{ type: 'breaking', name: 'uk' }],
				importance: 'Major',
			},
			status: 'failure',
			providerRef: null,
			failureReason: 'http_error',
			providerStatusCode: 500,
			createdAt: '2026-09-08T10:00:00.000Z',
			updatedAt: '2026-09-08T10:00:01.000Z',
		},
	],
};

describe('sendNotification', () => {
	it('preserves dispatch outcomes from a 502 response', async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve(
				new Response(JSON.stringify(failedNotification), {
					status: 502,
					headers: { 'content-type': 'application/json' },
				}),
			),
		) as unknown as typeof fetch;

		const result = await sendNotification(request);

		expect(result).toEqual({
			success: false,
			failure: {
				failure: 'dispatch-fail',
				notification: failedNotification,
			},
		});
	});

	it('preserves retryable HTTP semantics for an unstructured 502 response', async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve(
				new Response('<html>Bad gateway</html>', {
					status: 502,
					headers: { 'content-type': 'text/html' },
				}),
			),
		) as unknown as typeof fetch;

		const result = await sendNotification(request);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.failure).toMatchObject({
				failure: 'non-2xx-response',
				status: 502,
			});
		}
	});

	it('preserves an error envelope from a 502 response', async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve(
				new Response(
					JSON.stringify({
						error: 'bad_gateway',
						message: 'The upstream request failed.',
						requestId: 'request-123',
					}),
					{
						status: 502,
						headers: { 'content-type': 'application/json' },
					},
				),
			),
		) as unknown as typeof fetch;

		const result = await sendNotification(request);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.failure).toMatchObject({
				failure: 'non-2xx-response',
				status: 502,
				message: 'The upstream request failed.',
				requestId: 'request-123',
			});
		}
	});
});
