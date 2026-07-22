import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import {
	appPushNotificationSegments,
	MAX_APP_PUSH_SEGMENTS,
	MAX_NEWSLETTER_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	newsletterSegments,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import { startTestServer, type TestServer } from '../../test-utils/server';
import { channelAudiences, channelConstraints } from './index';

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

const getAudiences = (): Promise<Response> =>
	fetch(`${baseUrl}/v1/channels/audiences`);

describe('GET /v1/channels/constraints', () => {
	it('returns 200 with the per-channel constraints from config', async () => {
		const response = await getConstraints();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toEqual(channelConstraints);
	});

	it('exposes exactly the supported channels as top-level keys', async () => {
		const response = await getConstraints();
		const body = (await response.json()) as typeof channelConstraints;

		expect(Object.keys(body).sort()).toEqual(
			Object.values(NotificationChannel).sort(),
		);
	});

	it('exposes the push content limits, single-item compose and topic cap', async () => {
		const response = await getConstraints();
		const body = (await response.json()) as typeof channelConstraints;

		const push = body[NotificationChannel.AppPushNotification];

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

		const newsletter = body[NotificationChannel.Newsletter];

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

describe('GET /v1/channels/audiences', () => {
	it('returns 200 with the per-channel audience segments from config', async () => {
		const response = await getAudiences();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		expect(await response.json()).toEqual(channelAudiences);
	});

	it('exposes exactly the supported channels under `channels`', async () => {
		const response = await getAudiences();
		const body = (await response.json()) as typeof channelAudiences;

		expect(Object.keys(body.channels).sort()).toEqual(
			Object.values(NotificationChannel).sort(),
		);
	});

	it('exposes only the id and label of every push segment', async () => {
		const response = await getAudiences();
		const body = (await response.json()) as typeof channelAudiences;

		expect(
			body.channels[NotificationChannel.AppPushNotification].segments,
		).toEqual(
			Object.entries(appPushNotificationSegments).map(([id, { label }]) => ({
				id,
				label,
			})),
		);
	});

	it('exposes only the id and label of every newsletter segment', async () => {
		const response = await getAudiences();
		const body = (await response.json()) as typeof channelAudiences;

		expect(body.channels[NotificationChannel.Newsletter].segments).toEqual(
			Object.entries(newsletterSegments).map(([id, { label }]) => ({
				id,
				label,
			})),
		);
	});

	it('does not leak downstream addressing (campaign/topic)', async () => {
		const response = await getAudiences();
		const body = (await response.json()) as typeof channelAudiences;

		for (const { segments } of Object.values(body.channels)) {
			for (const segment of segments) {
				expect(Object.keys(segment).sort()).toEqual(['id', 'label']);
			}
		}
	});
});
