import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import {
	MAX_APP_PUSH_SEGMENTS,
	MAX_NEWSLETTER_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import { startTestServer, type TestServer } from '../../test-utils/server';
import { channelConstraints } from './index';

/**
 * Drives the real Express app over HTTP so the whole `GET
 * /v1/channels/constraints` chain runs through the mounted router.
 */

let server: TestServer;
let baseUrl: string;

beforeAll(async () => {
	server = await startTestServer();
	baseUrl = server.baseUrl;
});

afterAll(async () => {
	await server.close();
});

const getConstraints = (): Promise<Response> =>
	fetch(`${baseUrl}/v1/channels/constraints`);

describe('GET /v1/channels/constraints', () => {
	it('returns 200 with the per-channel constraints from config', async () => {
		const response = await getConstraints();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toEqual(channelConstraints);
	});

	it('exposes exactly the supported channels under `channels`', async () => {
		const response = await getConstraints();
		const body = (await response.json()) as typeof channelConstraints;

		expect(Object.keys(body.channels).sort()).toEqual(
			Object.values(NotificationChannel).sort(),
		);
	});

	it('exposes the push content limits, single-item compose and topic cap', async () => {
		const response = await getConstraints();
		const body = (await response.json()) as typeof channelConstraints;

		const push = body.channels[NotificationChannel.AppPushNotification];

		expect(push.content).toEqual(
			notificationChannelContentLimits[NotificationChannel.AppPushNotification],
		);
		expect(push.compose.minItems).toBe(1);
		expect(push.compose.maxItems).toBe(1);
		expect(push.audience.maxSegments).toBe(MAX_APP_PUSH_SEGMENTS);
	});

	it('exposes the newsletter content limits and subject limit', async () => {
		const response = await getConstraints();
		const body = (await response.json()) as typeof channelConstraints;

		const newsletter = body.channels[NotificationChannel.Newsletter];

		expect(newsletter.content).toEqual(
			notificationChannelContentLimits[NotificationChannel.Newsletter],
		);
		expect(newsletter.compose.subject.maxLength).toBe(
			notificationChannelContentLimits[NotificationChannel.Newsletter].title
				.maxLength,
		);
		expect(newsletter.compose.minItems).toBe(1);
		expect(newsletter.audience.maxSegments).toBe(MAX_NEWSLETTER_SEGMENTS);
		expect(newsletter.audience.maxTestRecipients).toBe(
			MAX_TEST_EMAIL_RECIPIENTS,
		);
	});
});
