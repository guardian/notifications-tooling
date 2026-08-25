import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from 'bun:test';
import {
	createNotificationDispatchesRepository,
	createNotificationsRepository,
} from '@database';
import {
	buildDispatch,
	buildNotification,
	setupTestDatabase,
} from '@database/test-helpers';
import { UserPermissions } from '@models';
import {
	authenticateRequests,
	installPandaAuthMock,
} from '../../utils/test-utils/panda-auth';
import {
	grantPermissions,
	installPermissionsStoreMock,
} from '../../utils/test-utils/permissions';
import type { TestServer } from '../../utils/test-utils/server';

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
