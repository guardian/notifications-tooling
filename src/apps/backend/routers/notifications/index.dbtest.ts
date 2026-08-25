import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	mock,
} from 'bun:test';
import { UserPermissions } from '@config';
import {
	createNotificationDispatchesRepository,
	createNotificationsRepository,
} from '@database';
import {
	buildDispatch,
	buildNotification,
	setupTestDatabase,
} from '@database/test-helpers';
import { httpLogger } from '@http-logger';
import { BrazeApiError } from '@services';
import express from 'express';
import { errorMiddleware } from '../../middleware/error-middleware';
import {
	authenticateRequests,
	installPandaAuthMock,
} from '../../utils/test-utils/panda-auth';
import {
	grantPermissions,
	installPermissionsStoreMock,
} from '../../utils/test-utils/permissions';
import type { TestServer } from '../../utils/test-utils/server';
import { createNotificationsRouter } from '.';

// Stub Panda verification and the permissions store before the app (and its
// real clients) are imported. The database is deliberately NOT mocked: this
// suite drives the endpoint against a real Postgres via the app's own `getDb`.
installPandaAuthMock();
installPermissionsStoreMock();
const { startTestServer } = await import('../../utils/test-utils/server');

let database: Awaited<ReturnType<typeof setupTestDatabase>>;
let notifications: ReturnType<typeof createNotificationsRepository>;
let dispatches: ReturnType<typeof createNotificationDispatchesRepository>;
let server: TestServer;
let baseUrl: string;

beforeAll(async () => {
	database = await setupTestDatabase();
	notifications = createNotificationsRepository(database.db);
	dispatches = createNotificationDispatchesRepository(database.db);

	authenticateRequests();
	grantPermissions([UserPermissions.DispatchAccess]);
	server = await startTestServer();
	baseUrl = server.baseUrl;
});

afterAll(async () => {
	await server.close();
	await database.close();
});

beforeEach(() => database.truncate());

describe('GET /v1/notifications/:id (real Postgres)', () => {
	it('returns the persisted notification and its dispatches', async () => {
		const notification = await notifications.create(buildNotification());
		await dispatches.upsert(
			buildDispatch(notification.id, {
				target: 'breaking-news',
				providerRef: 'mobile-n10n-1',
			}),
		);
		await dispatches.upsert(
			buildDispatch(notification.id, {
				channel: 'newsletter',
				target: 'morning-briefing-uk',
			}),
		);

		const response = await fetch(
			`${baseUrl}/v1/notifications/${notification.id}`,
		);

		expect(response.status).toBe(200);

		const body = (await response.json()) as {
			id: string;
			idempotencyKey: string;
			status: string;
			content: unknown;
			channels: unknown;
			createdAt: string;
			dispatches: Array<{
				channel: string;
				target: string;
				providerRef: string | null;
				status: string;
			}>;
		};

		expect(body.id).toBe(notification.id);
		expect(body.idempotencyKey).toBe(notification.idempotencyKey);
		expect(body.status).toBe('accepted');
		expect(body.content).toEqual(notification.content);
		expect(body.channels).toEqual(notification.channels);
		expect(typeof body.createdAt).toBe('string');

		expect(body.dispatches.map((dispatch) => dispatch.target)).toEqual([
			'breaking-news',
			'morning-briefing-uk',
		]);
		expect(body.dispatches[0]).toMatchObject({
			channel: 'app-push',
			target: 'breaking-news',
			providerRef: 'mobile-n10n-1',
			status: 'success',
		});
	});

	it('returns 404 when no notification exists with the id', async () => {
		const response = await fetch(
			`${baseUrl}/v1/notifications/11111111-1111-4111-8111-111111111111`,
		);

		expect(response.status).toBe(404);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBe('not_found');
	});
});

/** A minimal, fully valid single-channel app-push request. */
const validPushRequest = () => ({
	idempotencyKey: 'push-2026-07-08',
	sender: 'notifications-tooling-spa/v1',
	content: {
		items: {
			lead: {
				type: 'app-push',
				title: 'Ukraine summit begins',
				body: 'World leaders gather in Geneva as talks open.',
				link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
			},
		},
	},
	channels: {
		'app-push': {
			audience: {
				type: 'topic',
				items: [{ type: 'breaking-news', name: 'uk' }],
			},
			compose: { use: 'lead' },
		},
	},
});

/**
 * A custom app that mounts the notifications router with a stubbed dispatcher
 * but the real, default `sendNotificationStore`, so the endpoint persists to the
 * same Postgres the test asserts against.
 */
const startDispatchServer = (
	dispatch: NonNullable<Parameters<typeof createNotificationsRouter>[0]>,
) => {
	const testApp = express();
	testApp.use(httpLogger);
	testApp.use(express.json());
	testApp.use('/v1/notifications', createNotificationsRouter(dispatch));
	testApp.use(errorMiddleware);
	return startTestServer(testApp);
};

describe('POST /v1/notifications (real Postgres)', () => {
	it('persists the notification and its dispatch outcomes when every target delivers', async () => {
		const dispatch = mock((_request: unknown, notificationId: string) =>
			Promise.resolve({
				appPush: [
					{
						notificationId,
						id: 'mobile-n10n-1',
						topicType: 'breaking-news',
						status: 'success' as const,
					},
				],
				newsletter: [],
			}),
		);
		const dispatchServer = await startDispatchServer(dispatch);

		try {
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notifications`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(validPushRequest()),
				},
			);

			// Every target delivered, so the send reads as created + delivered.
			expect(response.status).toBe(201);
			const body = (await response.json()) as { id: string; status: string };
			expect(body.status).toBe('delivered');

			const stored = await notifications.findByIdWithDispatches(body.id);
			expect(stored).not.toBeNull();
			expect(stored).toMatchObject({
				idempotencyKey: 'push-2026-07-08',
				kind: 'send',
				status: 'delivered',
				sender: 'notifications-tooling-spa/v1',
				createdByEmail: 'ada.lovelace@guardian.co.uk',
				dryRun: false,
			});
			expect(stored?.content).toEqual(validPushRequest().content);
			expect(stored?.dispatches).toHaveLength(1);
			expect(stored?.dispatches[0]).toMatchObject({
				channel: 'app-push',
				target: 'breaking-news',
				providerRef: 'mobile-n10n-1',
				status: 'success',
			});
		} finally {
			await dispatchServer.close();
		}
	});

	it('rolls a mix of outcomes up to partially_delivered and stores each dispatch', async () => {
		const dispatch = mock((_request: unknown, notificationId: string) =>
			Promise.resolve({
				appPush: [
					{
						notificationId,
						id: 'mobile-n10n-1',
						topicType: 'breaking-news',
						status: 'success' as const,
					},
				],
				newsletter: [
					{
						notificationId,
						segmentId: 'morning-briefing-uk',
						campaignId: 'braze-campaign-1',
						dispatchId: 'braze-dispatch-1',
						status: 'failure' as const,
						failureReason: 'unknown' as const,
						providerStatusCode: 500,
					},
				],
			}),
		);
		const dispatchServer = await startDispatchServer(dispatch);

		try {
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notifications`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(validPushRequest()),
				},
			);

			expect(response.status).toBe(207);
			const body = (await response.json()) as { id: string; status: string };
			expect(body.status).toBe('partially_delivered');

			const stored = await notifications.findByIdWithDispatches(body.id);
			expect(stored?.status).toBe('partially_delivered');
			expect(stored?.dispatches).toHaveLength(2);

			const newsletter = stored?.dispatches.find(
				(dispatchRow) => dispatchRow.channel === 'newsletter',
			);
			expect(newsletter).toMatchObject({
				target: 'morning-briefing-uk',
				providerRef: 'braze-dispatch-1',
				status: 'failure',
				providerStatusCode: 500,
				detail: { campaignId: 'braze-campaign-1' },
			});
		} finally {
			await dispatchServer.close();
		}
	});

	it('persists a dry run as accepted with no dispatches', async () => {
		const dispatch = mock(() =>
			Promise.resolve({ appPush: [], newsletter: [] }),
		);
		const dispatchServer = await startDispatchServer(dispatch);

		try {
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notifications`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						...validPushRequest(),
						options: { dryRun: true },
					}),
				},
			);

			expect(response.status).toBe(202);
			const body = (await response.json()) as { id: string; status: string };
			expect(body.status).toBe('accepted');

			const stored = await notifications.findByIdWithDispatches(body.id);
			expect(stored).toMatchObject({ status: 'accepted', dryRun: true });
			expect(stored?.dispatches).toHaveLength(0);
		} finally {
			await dispatchServer.close();
		}
	});

	it('records the notification as failed when dispatch throws before any outcome', async () => {
		let dispatchedId: string | undefined;
		const dispatch = mock((_request: unknown, notificationId: string) => {
			dispatchedId = notificationId;
			return Promise.reject(
				new BrazeApiError('campaign trigger', 'http_error', 500),
			);
		});
		const dispatchServer = await startDispatchServer(dispatch);

		try {
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notifications`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(validPushRequest()),
				},
			);

			expect(response.status).toBe(502);

			const stored = await notifications.findByIdWithDispatches(dispatchedId!);
			expect(stored?.status).toBe('failed');
			expect(stored?.dispatches).toHaveLength(0);
		} finally {
			await dispatchServer.close();
		}
	});
});
