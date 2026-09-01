import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { httpLogger } from '@http-logger';
import { UserPermissions } from '@models';
import { BrazeApiError } from '@services';
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
import { createNotificationTestsRouter } from '.';

installPandaAuthMock();
installPermissionsStoreMock();
installDatabaseMock();
const { startTestServer } = await import('../../utils/test-utils/server');

let server: TestServer;
let baseUrl: string;

const validTestRequest = () => ({
	idempotencyKey: 'test-newsletter-2026-07-31',
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

beforeAll(async () => {
	authenticateRequests();
	grantPermissions([
		UserPermissions.DispatchAccess,
		UserPermissions.SendNotification,
	]);
	const app = express();
	app.use(httpLogger);
	app.use(express.json());
	app.use(
		'/v1/notification-tests',
		createNotificationTestsRouter(
			mock(() => Promise.resolve({ newsletter: [], appPush: [] })),
			mockNotificationStore({ notification: { kind: 'test' } }),
		),
	);
	server = await startTestServer(app);
	baseUrl = server.baseUrl;
});

afterAll(async () => {
	await server.close();
});

const postTest = (body: unknown) =>
	fetch(`${baseUrl}/v1/notification-tests`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});

describe('POST /v1/notification-tests', () => {
	it('blocks unauthenticated requests', async () => {
		await assertUnauthenticatedRequestBlocked(baseUrl, {
			method: 'POST',
			path: '/v1/notification-tests',
		});
	});

	it('blocks requests without the dispatch permission', async () => {
		await assertInsufficientPermissionsRequestBlocked(baseUrl, {
			method: 'POST',
			path: '/v1/notification-tests',
			body: validTestRequest(),
		});
	});

	it('accepts and dispatches a direct email test', async () => {
		const dispatchRequest = mock(() =>
			Promise.resolve({ newsletter: [], appPush: [] }),
		);
		const app = express();
		app.use(httpLogger);
		app.use(express.json());
		app.use(
			'/v1/notification-tests',
			createNotificationTestsRouter(
				dispatchRequest,
				mockNotificationStore({ notification: { kind: 'test' } }),
			),
		);
		const dispatchServer = await startTestServer(app);

		try {
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notification-tests`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(validTestRequest()),
				},
			);
			const body = (await response.json()) as {
				id: string;
				kind: string;
				status: string;
				dryRun: boolean;
				dispatches: unknown[];
			};

			expect(response.status).toBe(202);
			expect(body.dryRun).toBe(false);
			expect(dispatchRequest).toHaveBeenCalledWith(
				{
					...validTestRequest(),
					options: { dryRun: false },
				},
				expect.any(String),
			);
			expect(typeof body.id).toBe('string');
			expect(body.kind).toBe('test');
			expect(body.status).toBe('accepted');
			expect(body.dispatches).toEqual([]);
		} finally {
			await dispatchServer.close();
		}
	});

	it('preserves dry-run mode in dispatch and the acceptance response', async () => {
		const dispatchRequest = mock(() =>
			Promise.resolve({ newsletter: [], appPush: [] }),
		);
		const app = express();
		app.use(httpLogger);
		app.use(express.json());
		app.use(
			'/v1/notification-tests',
			createNotificationTestsRouter(
				dispatchRequest,
				mockNotificationStore({ notification: { kind: 'test' } }),
			),
		);
		const dispatchServer = await startTestServer(app);

		try {
			const request = {
				...validTestRequest(),
				options: { dryRun: true },
			};
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notification-tests`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(request),
				},
			);
			const body = (await response.json()) as { dryRun: boolean };

			expect(response.status).toBe(202);
			expect(dispatchRequest).toHaveBeenCalledWith(request, expect.any(String));
			expect(body.dryRun).toBe(true);
		} finally {
			await dispatchServer.close();
		}
	});

	it('accepts and dispatches an internal test app-push', async () => {
		const dispatchRequest = mock(() =>
			Promise.resolve({ newsletter: [], appPush: [] }),
		);
		const app = express();
		app.use(httpLogger);
		app.use(express.json());
		app.use(
			'/v1/notification-tests',
			createNotificationTestsRouter(
				dispatchRequest,
				mockNotificationStore({ notification: { kind: 'test' } }),
			),
		);
		const dispatchServer = await startTestServer(app);

		try {
			const request = {
				idempotencyKey: 'test-push-2026-07-31',
				sender: 'notifications-tooling-spa/v1',
				content: {
					items: {
						lead: {
							type: 'app-push',
							title: 'Breaking news',
							body: 'Historic global climate deal reached at the COP summit',
							link: 'https://www.theguardian.com/world/2026/jul/31/climate',
						},
					},
				},
				channels: {
					'app-push': {
						audience: {
							type: 'topic',
							items: [{ type: 'test', name: 'test' }],
						},
						compose: { use: 'lead' },
					},
				},
			};
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notification-tests`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(request),
				},
			);
			const body = (await response.json()) as {
				id: string;
				kind: string;
			};

			expect(response.status).toBe(202);
			expect(dispatchRequest).toHaveBeenCalledWith(
				{ ...request, options: { dryRun: false } },
				expect.any(String),
			);
			expect(typeof body.id).toBe('string');
			expect(body.kind).toBe('test');
		} finally {
			await dispatchServer.close();
		}
	});

	it('persists the test and exposes the recorded dispatches', async () => {
		const dispatchRequest = mock(() =>
			Promise.resolve({
				newsletter: [
					{
						testId: 'ignored',
						variant: 'UK',
						dispatchId: 'dispatch-1',
						status: 'success' as const,
					},
				],
				appPush: [],
			}),
		);
		const store = mockNotificationStore({
			notification: { kind: 'test' },
			dispatches: [
				{
					id: 'd1',
					notificationId: '00000000-0000-0000-0000-000000000000',
					channel: 'newsletter',
					target: 'UK',
					providerRef: 'dispatch-1',
					status: 'success',
					failureReason: null,
					providerStatusCode: null,
					detail: null,
					createdAt: new Date(0),
					updatedAt: new Date(0),
				},
			],
		});
		const app = express();
		app.use(httpLogger);
		app.use(express.json());
		app.use(
			'/v1/notification-tests',
			createNotificationTestsRouter(dispatchRequest, store),
		);
		const dispatchServer = await startTestServer(app);

		try {
			const response = await fetch(
				`${dispatchServer.baseUrl}/v1/notification-tests`,
				{
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify(validTestRequest()),
				},
			);

			// Every target succeeded, so the test send reads as created + delivered.
			expect(response.status).toBe(201);
			const body = (await response.json()) as {
				id: string;
				status: string;
				dispatches: Array<Record<string, unknown>>;
			};

			expect(body.status).toBe('delivered');
			expect(store.create).toHaveBeenCalledWith(
				expect.objectContaining({
					idempotencyKey: 'test-newsletter-2026-07-31',
				}),
				'ada.lovelace@guardian.co.uk',
			);
			expect(dispatchRequest).toHaveBeenCalledWith(expect.anything(), body.id);
			expect(body.dispatches).toEqual([
				{
					id: 'd1',
					channel: 'newsletter',
					target: 'UK',
					status: 'success',
					providerRef: 'dispatch-1',
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

	describe('provider failures surface as the documented HTTP codes', () => {
		// Dispatch that throws before any outcome is recorded (a config, SSM, or
		// DB failure) leaves the row flagged failed and returns it, not a 202.
		const startFailingServer = (
			rejection: Error,
			store = mockNotificationStore({ notification: { kind: 'test' } }),
		) => {
			const app = express();
			app.use(httpLogger);
			app.use(express.json());
			app.use(
				'/v1/notification-tests',
				createNotificationTestsRouter(
					mock(() => Promise.reject(rejection)),
					store,
				),
			);
			app.use(errorMiddleware);
			return startTestServer(app);
		};

		it('records the row as failed and returns a 502 when dispatch throws before recording outcomes', async () => {
			const store = mockNotificationStore({ notification: { kind: 'test' } });
			const dispatchServer = await startFailingServer(
				new BrazeApiError('test email send', 'http_error', 503),
				store,
			);

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
				const body = (await response.json()) as {
					status: string;
					dispatches: unknown[];
				};
				expect(body.status).toBe('failed');
				expect(body.dispatches).toEqual([]);

				// The row is flagged failed; no outcomes could be recorded.
				expect(store.markFailed).toHaveBeenCalledTimes(1);
				expect(store.recordOutcomes).not.toHaveBeenCalled();
			} finally {
				await dispatchServer.close();
			}
		});
	});

	it('rejects segment audiences', async () => {
		const request = validTestRequest();
		request.channels.newsletter.audience = {
			type: 'segment',
			items: ['UK'],
		};

		const response = await postTest(request);
		expect(response.status).toBe(400);

		const body = (await response.json()) as {
			error: string;
			message: string;
			details: Array<{ code: string; path: string; message: string }>;
		};
		expect(body.error).toBe('bad_request');
		expect(body.message).toBe('The request body is malformed.');
		expect(body.details.length).toBeGreaterThan(0);
		const [firstDetail] = body.details;
		expect(typeof firstDetail?.code).toBe('string');
		expect(typeof firstDetail?.path).toBe('string');
		expect(typeof firstDetail?.message).toBe('string');
	});
});
