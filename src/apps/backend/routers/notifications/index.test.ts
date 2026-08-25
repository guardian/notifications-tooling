import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { UserPermissions } from '@config';
import type {
	NotificationListPage,
	NotificationWithDispatches,
} from '@database';
import { httpLogger } from '@http-logger';
import { AppNotificationApiError, BrazeApiError } from '@services';
import express from 'express';
import { errorMiddleware } from '../../middleware/error-middleware';
import {
	installDatabaseMock,
	mockNotificationStore,
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
import { createNotificationsRouter } from '.';

// Stub Panda verification and the permissions store before the app (and its
// real clients) are imported.
installPandaAuthMock();
installPermissionsStoreMock();
installDatabaseMock();
const { startTestServer } = await import('../../utils/test-utils/server');

/**
 * These tests drive the real Express app over HTTP so the whole `POST
 * /v1/notifications` chain runs: `express.json()` -> the `express-zod-safe`
 * `validate` middleware -> our error hook -> the 202 handler.
 */

let server: TestServer;
let baseUrl: string;

beforeAll(async () => {
	authenticateRequests();
	grantPermissions([UserPermissions.DispatchAccess]);
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

describe('POST /v1/notifications', () => {
	describe('authentication', () => {
		it('blocks unauthenticated POST /v1/notifications', async () => {
			await assertUnauthenticatedRequestBlocked(baseUrl, {
				method: 'POST',
				path: '/v1/notifications',
			});
		});
	});

	describe('permissions', () => {
		it('blocks POST /v1/notifications without the dispatch permission', async () => {
			await assertInsufficientPermissionsRequestBlocked(baseUrl, {
				method: 'POST',
				path: '/v1/notifications',
				body: validPushRequest(),
			});
		});
	});

	describe('happy path', () => {
		it('dispatches the validated request before accepting it', async () => {
			const dispatchRequest = mock(() =>
				Promise.resolve({ appPush: [], newsletter: [] }),
			);
			const testApp = express();
			testApp.use(httpLogger);
			testApp.use(express.json());
			testApp.use(
				'/v1/notifications',
				createNotificationsRouter(dispatchRequest, mockNotificationStore()),
			);
			const dispatchServer = await startTestServer(testApp);

			try {
				const response = await fetch(
					`${dispatchServer.baseUrl}/v1/notifications`,
					{
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(validPushRequest()),
					},
				);

				expect(response.status).toBe(202);
				expect(dispatchRequest).toHaveBeenCalledWith(
					{
						...validPushRequest(),
						options: { dryRun: false, scheduledFor: null },
					},
					expect.any(String),
				);
			} finally {
				await dispatchServer.close();
			}
		});

		it('accepts a valid request with 202 and the stored notification resource', async () => {
			const testApp = express();
			testApp.use(httpLogger);
			testApp.use(express.json());
			testApp.use(
				'/v1/notifications',
				createNotificationsRouter(
					mock(() => Promise.resolve({ appPush: [], newsletter: [] })),
					mockNotificationStore(),
				),
			);
			const dispatchServer = await startTestServer(testApp);

			try {
				const response = await fetch(
					`${dispatchServer.baseUrl}/v1/notifications`,
					{
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(validPushRequest()),
					},
				);

				expect(response.status).toBe(202);

				const body = (await response.json()) as {
					id: string;
					kind: string;
					status: string;
					dryRun: boolean;
					scheduledFor: string | null;
					createdAt: string;
					dispatches: unknown[];
				};

				expect(typeof body.id).toBe('string');
				expect(body.id.length).toBeGreaterThan(0);
				expect(body.kind).toBe('send');
				// No dispatches were returned, so the status stays accepted.
				expect(body.status).toBe('accepted');
				expect(body.dryRun).toBe(false);
				expect(body.dispatches).toEqual([]);
			} finally {
				await dispatchServer.close();
			}
		});

		it('persists the notification and exposes the recorded dispatches', async () => {
			const dispatchRequest = mock(() =>
				Promise.resolve({
					appPush: [
						{
							notificationId: 'ignored',
							id: 'push-1',
							topicType: 'breaking-news',
							status: 'success' as const,
						},
					],
					newsletter: [],
				}),
			);
			const store = mockNotificationStore({
				dispatches: [
					{
						id: 'd1',
						notificationId: '00000000-0000-0000-0000-000000000000',
						channel: 'app-push',
						target: 'breaking-news',
						providerRef: 'push-1',
						status: 'success',
						failureReason: null,
						providerStatusCode: null,
						detail: null,
						createdAt: new Date(0),
						updatedAt: new Date(0),
					},
				],
			});
			const testApp = express();
			testApp.use(httpLogger);
			testApp.use(express.json());
			testApp.use(
				'/v1/notifications',
				createNotificationsRouter(dispatchRequest, store),
			);
			const dispatchServer = await startTestServer(testApp);

			try {
				const response = await fetch(
					`${dispatchServer.baseUrl}/v1/notifications`,
					{
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(validPushRequest()),
					},
				);

				// Every target succeeded, so the send reads as created + delivered.
				expect(response.status).toBe(201);
				const body = (await response.json()) as {
					id: string;
					status: string;
					dispatches: Array<Record<string, unknown>>;
				};

				expect(body.status).toBe('delivered');
				expect(store.create).toHaveBeenCalledWith(
					expect.objectContaining({ idempotencyKey: 'push-2026-07-08' }),
					'ada.lovelace@guardian.co.uk',
				);
				expect(dispatchRequest).toHaveBeenCalledWith(
					expect.anything(),
					body.id,
				);
				expect(body.dispatches).toEqual([
					{
						id: 'd1',
						channel: 'app-push',
						target: 'breaking-news',
						status: 'success',
						providerRef: 'push-1',
						failureReason: null,
						providerStatusCode: null,
						detail: null,
						createdAt: '1970-01-01T00:00:00.000Z',
						updatedAt: '1970-01-01T00:00:00.000Z',
					},
				]);
			} finally {
				await dispatchServer.close();
			}
		});
	});

	describe('provider failures surface as the documented HTTP codes', () => {
		// Dispatch rethrows the underlying provider error; errorMiddleware maps it.
		const startFailingServer = (rejection: Error) => {
			const testApp = express();
			testApp.use(httpLogger);
			testApp.use(express.json());
			testApp.use(
				'/v1/notifications',
				createNotificationsRouter(
					mock(() => Promise.reject(rejection)),
					mockNotificationStore(),
				),
			);
			testApp.use(errorMiddleware);
			return startTestServer(testApp);
		};

		it('maps an upstream provider rejection to 502', async () => {
			const dispatchServer = await startFailingServer(
				new BrazeApiError('campaign trigger', 'http_error', 500),
			);

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
				const body = (await response.json()) as { error: string };
				expect(body.error).toBe('braze_request_failed');
			} finally {
				await dispatchServer.close();
			}
		});

		it('maps an upstream provider timeout to 504', async () => {
			const dispatchServer = await startFailingServer(
				new AppNotificationApiError('timeout'),
			);

			try {
				const response = await fetch(
					`${dispatchServer.baseUrl}/v1/notifications`,
					{
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify(validPushRequest()),
					},
				);

				expect(response.status).toBe(504);
				const body = (await response.json()) as { error: string };
				expect(body.error).toBe('app_notification_failed');
			} finally {
				await dispatchServer.close();
			}
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

		it('rejects an unknown channel', async () => {
			const request = validPushRequest() as unknown as {
				channels: Record<string, unknown>;
			};
			request.channels.telegram = {
				audience: { type: 'segment', items: ['breaking-news-uk'] },
				compose: { use: 'lead' },
			};

			const response = await postNotification(request);

			expect(response.status).toBe(400);

			const body = (await response.json()) as { error: string };
			expect(body.error).toBe('bad_request');
		});

		it('rejects direct email audiences', async () => {
			const request = validPushRequest() as unknown as {
				content: { items: Record<string, unknown> };
				channels: Record<string, unknown>;
			};
			request.content.items.lead = {
				type: 'newsletter',
				title: 'Morning briefing',
				body: "Today's lead story.",
				link: 'https://www.theguardian.com/world/2026/jul/31/morning-briefing',
			};
			request.channels = {
				newsletter: {
					audience: {
						type: 'email',
						items: ['editor@theguardian.com'],
					},
					variants: ['UK'],
					compose: { items: ['lead'], subject: '[TEST] Morning briefing' },
				},
			};

			const response = await postNotification(request);
			expect(response.status).toBe(400);
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
			request.channels['app-push'].compose.use = 'missing';

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

const notificationId = '11111111-1111-4111-8111-111111111111';

/** A stored notification with a single successful app-push dispatch. */
const storedNotification = (): NotificationWithDispatches => ({
	id: notificationId,
	idempotencyKey: 'push-2026-07-08',
	kind: 'send',
	status: 'delivered',
	sender: 'notifications-tooling-spa/v1',
	createdByEmail: 'editor@theguardian.com',
	dryRun: false,
	scheduledFor: null,
	content: { items: { lead: { type: 'app-push', title: 'Ukraine summit' } } },
	channels: { 'app-push': { compose: { use: 'lead' } } },
	createdAt: new Date('2026-07-08T09:00:00.000Z'),
	updatedAt: new Date('2026-07-08T09:00:05.000Z'),
	dispatches: [
		{
			id: '22222222-2222-4222-8222-222222222222',
			notificationId,
			channel: 'app-push',
			target: 'breaking-news',
			providerRef: 'mob-123',
			status: 'success',
			failureReason: null,
			providerStatusCode: null,
			detail: { editions: ['uk'] },
			createdAt: new Date('2026-07-08T09:00:01.000Z'),
			updatedAt: new Date('2026-07-08T09:00:01.000Z'),
		},
	],
});

const startLookupServer = (
	findNotification: (id: string) => Promise<NotificationWithDispatches | null>,
) => {
	const testApp = express();
	testApp.use(httpLogger);
	testApp.use(express.json());
	testApp.use(
		'/v1/notifications',
		createNotificationsRouter(
			mock(() => Promise.resolve({ appPush: [], newsletter: [] })),
			mockNotificationStore(),
			findNotification,
		),
	);
	return startTestServer(testApp);
};

describe('GET /v1/notifications/:id', () => {
	describe('authentication', () => {
		it('blocks unauthenticated GET /v1/notifications/:id', async () => {
			await assertUnauthenticatedRequestBlocked(baseUrl, {
				method: 'GET',
				path: `/v1/notifications/${notificationId}`,
			});
		});
	});

	describe('permissions', () => {
		it('blocks GET /v1/notifications/:id without the dispatch permission', async () => {
			await assertInsufficientPermissionsRequestBlocked(baseUrl, {
				method: 'GET',
				path: `/v1/notifications/${notificationId}`,
			});
		});
	});

	describe('happy path', () => {
		it('returns the persisted notification and its dispatches', async () => {
			const findNotification = mock(() =>
				Promise.resolve(storedNotification()),
			);
			const lookupServer = await startLookupServer(findNotification);

			try {
				const response = await fetch(
					`${lookupServer.baseUrl}/v1/notifications/${notificationId}`,
				);

				expect(response.status).toBe(200);
				expect(findNotification).toHaveBeenCalledWith(notificationId);

				const body = (await response.json()) as {
					id: string;
					status: string;
					createdAt: string;
					dispatches: Array<Record<string, unknown>>;
				};

				expect(body.id).toBe(notificationId);
				expect(body.status).toBe('delivered');
				expect(body.createdAt).toBe('2026-07-08T09:00:00.000Z');
				expect(body.dispatches).toHaveLength(1);
				expect(body.dispatches[0]).toMatchObject({
					channel: 'app-push',
					target: 'breaking-news',
					providerRef: 'mob-123',
					status: 'success',
					providerStatusCode: null,
				});
				// The notificationId is redundant on each nested dispatch.
				expect(body.dispatches[0]).not.toHaveProperty('notificationId');
			} finally {
				await lookupServer.close();
			}
		});
	});

	describe('not found', () => {
		it('returns 404 when no notification exists with the id', async () => {
			const lookupServer = await startLookupServer(() => Promise.resolve(null));

			try {
				const response = await fetch(
					`${lookupServer.baseUrl}/v1/notifications/${notificationId}`,
				);

				expect(response.status).toBe(404);
				const body = (await response.json()) as { error: string };
				expect(body.error).toBe('not_found');
			} finally {
				await lookupServer.close();
			}
		});
	});

	describe('bad request', () => {
		it('returns 400 when the id is not a valid UUID', async () => {
			const findNotification = mock(() =>
				Promise.resolve(storedNotification()),
			);
			const lookupServer = await startLookupServer(findNotification);

			try {
				const response = await fetch(
					`${lookupServer.baseUrl}/v1/notifications/not-a-uuid`,
				);

				expect(response.status).toBe(400);
				const body = (await response.json()) as {
					error: string;
					details: Array<{ path: string }>;
				};
				expect(body.error).toBe('bad_request');
				expect(body.details.some((detail) => detail.path === '/id')).toBe(true);
				expect(findNotification).not.toHaveBeenCalled();
			} finally {
				await lookupServer.close();
			}
		});
	});
});

/** A one-notification page (no dispatches) for the list endpoint tests. */
const storedListPage = (): NotificationListPage => ({
	total: 3,
	notifications: [
		{
			id: notificationId,
			idempotencyKey: 'push-2026-07-08',
			kind: 'send',
			status: 'delivered',
			sender: 'notifications-tooling-spa/v1',
			createdByEmail: 'editor@theguardian.com',
			dryRun: false,
			scheduledFor: null,
			content: { items: { lead: { type: 'app-push' } } },
			channels: { 'app-push': { compose: { use: 'lead' } } },
			createdAt: new Date('2026-07-08T09:00:00.000Z'),
			updatedAt: new Date('2026-07-08T09:00:05.000Z'),
		},
	],
});

const startListServer = (
	listNotifications: (options: {
		limit?: number;
		offset?: number;
	}) => Promise<NotificationListPage>,
) => {
	const testApp = express();
	testApp.use(httpLogger);
	testApp.use(express.json());
	testApp.use(
		'/v1/notifications',
		createNotificationsRouter(
			mock(() => Promise.resolve({ appPush: [], newsletter: [] })),
			mockNotificationStore(),
			mock(() => Promise.resolve(null)),
			listNotifications,
		),
	);
	return startTestServer(testApp);
};

describe('GET /v1/notifications', () => {
	describe('authentication', () => {
		it('blocks unauthenticated GET /v1/notifications', async () => {
			await assertUnauthenticatedRequestBlocked(baseUrl, {
				method: 'GET',
				path: '/v1/notifications',
			});
		});
	});

	describe('permissions', () => {
		it('blocks GET /v1/notifications without the dispatch permission', async () => {
			await assertInsufficientPermissionsRequestBlocked(baseUrl, {
				method: 'GET',
				path: '/v1/notifications',
			});
		});
	});

	describe('happy path', () => {
		it('returns the window total and a page of notifications without dispatches', async () => {
			const listNotifications = mock(() => Promise.resolve(storedListPage()));
			const listServer = await startListServer(listNotifications);

			try {
				const response = await fetch(
					`${listServer.baseUrl}/v1/notifications?limit=5&offset=2`,
				);

				expect(response.status).toBe(200);
				expect(listNotifications).toHaveBeenCalledWith({ limit: 5, offset: 2 });

				const body = (await response.json()) as {
					total: number;
					limit: number;
					offset: number;
					notifications: Array<Record<string, unknown>>;
				};

				expect(body.total).toBe(3);
				expect(body.limit).toBe(5);
				expect(body.offset).toBe(2);
				expect(body.notifications).toHaveLength(1);
				expect(body.notifications[0]).toMatchObject({
					id: notificationId,
					status: 'delivered',
					createdAt: '2026-07-08T09:00:00.000Z',
				});
				// The list endpoint does not join dispatches.
				expect(body.notifications[0]).not.toHaveProperty('dispatches');
			} finally {
				await listServer.close();
			}
		});

		it('defaults to limit 10 / offset 0 when neither is supplied', async () => {
			const listNotifications = mock(() => Promise.resolve(storedListPage()));
			const listServer = await startListServer(listNotifications);

			try {
				const response = await fetch(`${listServer.baseUrl}/v1/notifications`);

				expect(response.status).toBe(200);
				expect(listNotifications).toHaveBeenCalledWith({
					limit: 10,
					offset: 0,
				});

				const body = (await response.json()) as {
					limit: number;
					offset: number;
				};
				expect(body.limit).toBe(10);
				expect(body.offset).toBe(0);
			} finally {
				await listServer.close();
			}
		});
	});

	describe('bad request', () => {
		it('returns 400 when limit is out of the 1–50 range', async () => {
			const listNotifications = mock(() => Promise.resolve(storedListPage()));
			const listServer = await startListServer(listNotifications);

			try {
				const response = await fetch(
					`${listServer.baseUrl}/v1/notifications?limit=51&offset=0`,
				);

				expect(response.status).toBe(400);
				const body = (await response.json()) as { error: string };
				expect(body.error).toBe('bad_request');
				expect(listNotifications).not.toHaveBeenCalled();
			} finally {
				await listServer.close();
			}
		});

		it('returns 400 when only one of limit/offset is supplied', async () => {
			const listNotifications = mock(() => Promise.resolve(storedListPage()));
			const listServer = await startListServer(listNotifications);

			try {
				const response = await fetch(
					`${listServer.baseUrl}/v1/notifications?limit=5`,
				);

				expect(response.status).toBe(400);
				const body = (await response.json()) as { error: string };
				expect(body.error).toBe('bad_request');
				expect(listNotifications).not.toHaveBeenCalled();
			} finally {
				await listServer.close();
			}
		});
	});
});
