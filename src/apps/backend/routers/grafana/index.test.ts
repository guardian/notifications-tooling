import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { UserPermissions } from '@models';
import {
	buildPersistedNotification,
	installDatabaseMock,
	listRecentWithDispatchesMock,
} from '../../utils/test-utils/database';
import {
	assertUnauthenticatedRequestBlocked,
	authenticateRequests,
	installPandaAuthMock,
} from '../../utils/test-utils/panda-auth';
import {
	assertInsufficientPermissionsRequestBlocked,
	grantPermissions,
	installPermissionsStoreMock,
} from '../../utils/test-utils/permissions';
import type { TestServer } from '../../utils/test-utils/server';

installPandaAuthMock();
installPermissionsStoreMock();
installDatabaseMock();
const { startTestServer } = await import('../../utils/test-utils/server');

let server: TestServer;

type GrafanaTableResponse = Array<{ rows: unknown[][] }>;

beforeAll(async () => {
	authenticateRequests();
	grantPermissions([UserPermissions.DispatchAccess]);
	server = await startTestServer();
});

afterAll(async () => {
	await server.close();
});

describe('Grafana datasource endpoints', () => {
	for (const path of ['/metrics', '/query']) {
		it(`blocks unauthenticated POST ${path}`, async () => {
			await assertUnauthenticatedRequestBlocked(server.baseUrl, {
				method: 'POST',
				path,
			});
		});

		it(`blocks requests without dispatch access for ${path}`, async () => {
			await assertInsufficientPermissionsRequestBlocked(server.baseUrl, {
				method: 'POST',
				path,
			});
		});
	}

	it('returns the available notification metric', async () => {
		const response = await fetch(`${server.baseUrl}/metrics`, {
			method: 'POST',
		});

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual([
			{ label: 'Notifications', value: 'notifications' },
		]);
	});

	it('allows credentialed requests from Grafana', async () => {
		const response = await fetch(`${server.baseUrl}/metrics`, {
			method: 'POST',
			headers: { Origin: 'https://metrics.gutools.co.uk' },
		});

		expect(response.headers.get('access-control-allow-origin')).toBe(
			'https://metrics.gutools.co.uk',
		);
		expect(response.headers.get('access-control-allow-credentials')).toBe(
			'true',
		);
	});

	it('handles the credentialed metrics preflight', async () => {
		const response = await fetch(`${server.baseUrl}/metrics`, {
			method: 'OPTIONS',
			headers: { Origin: 'https://metrics.gutools.co.uk' },
		});

		expect(response.status).toBe(204);
		expect(response.headers.get('access-control-allow-methods')).toBe(
			'POST, OPTIONS',
		);
	});

	it('returns an empty Grafana table for the notification query', async () => {
		const response = await fetch(`${server.baseUrl}/query`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				range: {
					from: '2026-09-01T00:00:00.000Z',
					to: '2026-09-09T00:00:00.000Z',
				},
				targets: [{ target: 'notifications', refId: 'A' }],
			}),
		});

		expect(response.status).toBe(200);
		const body = (await response.json()) as GrafanaTableResponse;
		expect(body[0]?.rows).toEqual([]);
	});

	it('rejects an unsupported metric', async () => {
		const response = await fetch(`${server.baseUrl}/query`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				range: {
					from: '2026-09-01T00:00:00.000Z',
					to: '2026-09-09T00:00:00.000Z',
				},
				targets: [{ target: 'other-metric', refId: 'A' }],
			}),
		});

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: 'unsupported_metric',
			message: "The supported metric is 'notifications'.",
		});
	});

	it('returns newsletter and app-push dispatch details', async () => {
		const persistedNotification = buildPersistedNotification({
			notification: {
				status: 'partially_delivered',
				createdAt: new Date('2026-09-03T12:00:00.000Z'),
				createdByEmail: 'editor@theguardian.com',
			},
			dispatches: [
				{
					id: '10000000-0000-4000-8000-000000000001',
					notificationId: '00000000-0000-0000-0000-000000000000',
					channel: 'newsletter',
					requested: { channel: 'newsletter', segment: 'UK' },
					resolved: {
						channel: 'newsletter',
						emailRenderingId: 'newsletter-1',
					},
					providerRef: 'campaign-1',
					status: 'success',
					failureReason: null,
					providerStatusCode: null,
					createdAt: new Date('2026-09-03T12:00:01.000Z'),
					updatedAt: new Date('2026-09-03T12:00:01.000Z'),
				},
				{
					id: '20000000-0000-4000-8000-000000000002',
					notificationId: '00000000-0000-0000-0000-000000000000',
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
					providerRef: null,
					status: 'failure',
					failureReason: 'http_error',
					providerStatusCode: 500,
					createdAt: new Date('2026-09-03T12:00:02.000Z'),
					updatedAt: new Date('2026-09-03T12:00:02.000Z'),
				},
			],
		});
		listRecentWithDispatchesMock.mockImplementationOnce(() =>
			Promise.resolve([
				{
					...persistedNotification.notification,
					dispatches: persistedNotification.dispatches,
				},
			]),
		);

		const response = await fetch(`${server.baseUrl}/query`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				range: {
					from: '2026-09-01T00:00:00.000Z',
					to: '2026-09-09T00:00:00.000Z',
				},
				targets: [{ target: 'notifications', refId: 'A' }],
			}),
		});

		expect(response.status).toBe(200);
		const body = (await response.json()) as GrafanaTableResponse;
		expect(body[0]?.rows).toEqual([
			[
				1788436801000,
				'00000000-0000-0000-0000-000000000000',
				'newsletter',
				'editor@theguardian.com',
				'partially_delivered',
				'success',
				null,
				null,
			],
			[
				1788436802000,
				'00000000-0000-0000-0000-000000000000',
				'app-push',
				'editor@theguardian.com',
				'partially_delivered',
				'failure',
				500,
				'http_error',
			],
		]);
	});
});
