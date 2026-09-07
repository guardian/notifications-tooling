import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	mock,
} from 'bun:test';
import { createNotificationsRepository } from '@database';
import { setupTestDatabase } from '@database/test-helpers';
import { httpLogger } from '@http-logger';
import { UserPermissions } from '@models';
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

// Stub Panda verification and the permissions store before the app (and its
// real clients) are imported. The router is imported dynamically below so the
// real pan-domain auth module (which polls S3 on construction) never loads
// before the mock is installed. The database is deliberately NOT mocked: this
// suite drives the endpoint against a real Postgres via the app's own `getDb`.
installPandaAuthMock();
installPermissionsStoreMock();
const { startTestServer } = await import('../../utils/test-utils/server');
const { createNotificationTestsRouter } = await import('.');

let database: Awaited<ReturnType<typeof setupTestDatabase>>;
let notifications: ReturnType<typeof createNotificationsRepository>;

beforeAll(async () => {
	database = await setupTestDatabase();
	notifications = createNotificationsRepository(database.db);

	authenticateRequests();
	grantPermissions([
		UserPermissions.DispatchAccess,
		UserPermissions.SendNotification,
	]);
});

afterAll(() => database.close());

beforeEach(() => database.truncate());

/** A minimal, fully valid single-channel newsletter test request. */
const validTestRequest = () => ({
	idempotencyKey: `test-${crypto.randomUUID()}`,
	sender: 'notifications-tooling-spa/v1',
	content: {
		items: {
			lead: {
				type: 'newsletter',
				title: 'Morning briefing',
				body: "Today's lead story.",
				link: 'https://www.theguardian.com/world/2026/jul/31/morning-briefing',
			},
		},
	},
	channels: {
		newsletter: {
			audience: {
				type: 'email',
				items: ['editor@theguardian.com'],
			},
			variants: ['UK'],
			compose: { items: ['lead'], subject: '[TEST] Morning briefing' },
		},
	},
});

/**
 * A custom app that mounts the notification-tests router with a stubbed
 * dispatcher but the real, default `testNotificationStore`, so the endpoint
 * persists to the same Postgres the test asserts against.
 */
const startDispatchServer = (
	dispatch: NonNullable<Parameters<typeof createNotificationTestsRouter>[0]>,
) => {
	const testApp = express();
	testApp.use(httpLogger);
	testApp.use(express.json());
	testApp.use(
		'/v1/notification-tests',
		createNotificationTestsRouter(dispatch),
	);
	testApp.use(errorMiddleware);
	return startTestServer(testApp);
};

describe('POST /v1/notification-tests (real Postgres)', () => {
	it('persists the test notification and its dispatch when delivery succeeds', async () => {
		const dispatch = mock((_request: unknown, testId: string) =>
			Promise.resolve({
				appPush: [],
				newsletter: [
					{
						testId,
						variant: 'UK',
						emailRenderingId: 'braze-newsletter-1',
						dispatchId: 'braze-dispatch-1',
						status: 'success' as const,
					},
				],
			}),
		);
		const dispatchServer = await startDispatchServer(dispatch);

		try {
			const request = validTestRequest();
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notification-tests`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(request),
				},
			);

			// Every target delivered, so the test send reads as created + delivered.
			expect(response.status).toBe(201);
			const body = (await response.json()) as { id: string; status: string };
			expect(body.status).toBe('delivered');

			const stored = await notifications.findByIdWithDispatches(body.id);
			expect(stored).not.toBeNull();
			expect(stored).toMatchObject({
				idempotencyKey: request.idempotencyKey,
				kind: 'test',
				status: 'delivered',
				createdByEmail: 'ada.lovelace@guardian.co.uk',
				dryRun: false,
			});
			expect(stored?.dispatches).toHaveLength(1);
			expect(stored?.dispatches[0]).toMatchObject({
				channel: 'newsletter',
				target: 'UK',
				providerRef: 'braze-dispatch-1',
				status: 'success',
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
				`${dispatchServer.baseUrl}/v1/notification-tests`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						...validTestRequest(),
						options: { dryRun: true },
					}),
				},
			);

			expect(response.status).toBe(202);
			const body = (await response.json()) as { id: string; status: string };
			expect(body.status).toBe('accepted');

			const stored = await notifications.findByIdWithDispatches(body.id);
			expect(stored).toMatchObject({
				kind: 'test',
				status: 'accepted',
				dryRun: true,
			});
			expect(stored?.dispatches).toHaveLength(0);
		} finally {
			await dispatchServer.close();
		}
	});

	it('records the test notification as failed when dispatch throws before any outcome', async () => {
		let dispatchedId: string | undefined;
		const dispatch = mock((_request: unknown, testId: string) => {
			dispatchedId = testId;
			return Promise.reject(
				new BrazeApiError('campaign trigger', 'http_error', 500),
			);
		});
		const dispatchServer = await startDispatchServer(dispatch);

		try {
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notification-tests`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(validTestRequest()),
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
