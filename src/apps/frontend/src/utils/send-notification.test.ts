import { afterEach, describe, expect, it, mock } from 'bun:test';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from '../schemas';
import { sendNotification } from './send-notification';

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
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
			target: 'breaking-news/uk',
			status: 'failure',
			providerRef: null,
			failureReason: 'http_error',
			providerStatusCode: 500,
			detail: null,
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
});
