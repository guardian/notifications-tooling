import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { httpLogger } from '@http-logger';
import { UserPermissions } from '@models';
import { BrazeApiError, EmailRenderingError } from '@services';
import express from 'express';
import { errorMiddleware } from '../../middleware/error-middleware';
import { installDatabaseMock } from '../../utils/test-utils/database';
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
			createNotificationTestsRouter(dispatchRequest),
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
				testId: string;
				status: string;
				dryRun: boolean;
				plans: Array<{ channel: string; planId: string; status: string }>;
				statusUrl: string;
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
			expect(body.status).toBe('accepted');
			expect(body.plans).toEqual([
				{
					channel: 'newsletter',
					planId: `${body.testId}#newsletter`,
					status: 'accepted',
				},
			]);
			expect(body.statusUrl).toBe(
				`/v1/notification-tests/${body.testId}/status`,
			);
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
			createNotificationTestsRouter(dispatchRequest),
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
			createNotificationTestsRouter(dispatchRequest),
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
				testId: string;
				plans: Array<{ channel: string; planId: string; status: string }>;
			};

			expect(response.status).toBe(202);
			expect(dispatchRequest).toHaveBeenCalledWith(
				{ ...request, options: { dryRun: false } },
				expect.any(String),
			);
			expect(body.plans).toEqual([
				{
					channel: 'app-push',
					planId: `${body.testId}#app-push`,
					status: 'accepted',
				},
			]);
		} finally {
			await dispatchServer.close();
		}
	});

	describe('provider failures surface as the documented HTTP codes', () => {
		// Dispatch rethrows the underlying provider error; errorMiddleware maps it.
		const startFailingServer = (rejection: Error) => {
			const app = express();
			app.use(httpLogger);
			app.use(express.json());
			app.use(
				'/v1/notification-tests',
				createNotificationTestsRouter(mock(() => Promise.reject(rejection))),
			);
			app.use(errorMiddleware);
			return startTestServer(app);
		};

		it('maps an upstream provider rejection to 502', async () => {
			const dispatchServer = await startFailingServer(
				new EmailRenderingError(500, 'http_error'),
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
				const body = (await response.json()) as { error: string };
				expect(body.error).toBe('email_rendering_failed');
			} finally {
				await dispatchServer.close();
			}
		});

		it('maps an upstream provider timeout to 504', async () => {
			const dispatchServer = await startFailingServer(
				new BrazeApiError('test email send', 'timeout'),
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

				expect(response.status).toBe(504);
				const body = (await response.json()) as { error: string };
				expect(body.error).toBe('braze_request_failed');
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
