import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { UserPermissions } from '@config';
import express from 'express';
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
	grantPermissions([UserPermissions.DispatchAccess]);
	const app = express();
	app.use(express.json());
	app.use(
		'/v1/notification-tests',
		createNotificationTestsRouter(mock(() => Promise.resolve())),
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
		const dispatchRequest = mock(() => Promise.resolve());
		const app = express();
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
				plans: Array<{ channel: string; planId: string; status: string }>;
				statusUrl: string;
			};

			expect(response.status).toBe(202);
			expect(dispatchRequest).toHaveBeenCalledWith({
				...validTestRequest(),
				options: { dryRun: false },
			});
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

	it('rejects segment audiences', async () => {
		const request = validTestRequest();
		request.channels.newsletter.audience = {
			type: 'segment',
			items: ['UK'],
		};

		const response = await postTest(request);
		expect(response.status).toBe(400);
	});
});
