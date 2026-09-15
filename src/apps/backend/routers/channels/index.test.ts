import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import {
	appPushTopicTypes,
	MAX_APP_PUSH_TOPICS,
	MAX_NEWSLETTER_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	newsletterSegments,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import type { NewsletterSegmentId } from '@models';
import { UserPermissions } from '@models';
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
import { channelAudiences, channelConstraints } from './index';

// Stub Panda verification and the permissions store before the app (and its
// real clients) are imported.
installPandaAuthMock();
installPermissionsStoreMock();
installDatabaseMock();
const { startTestServer } = await import('../../utils/test-utils/server');

/**
 * Drives the real Express app over HTTP so the whole `GET
 * /v1/channels/constraints` chain runs through the mounted router.
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

const getConstraints = (): Promise<Response> =>
	fetch(`${baseUrl}/v1/channels/constraints`);

const getAudiences = (): Promise<Response> =>
	fetch(`${baseUrl}/v1/channels/audiences`);

describe('/v1/channels authentication', () => {
	it('blocks unauthenticated GET /v1/channels/constraints', async () => {
		await assertUnauthenticatedRequestBlocked(baseUrl, {
			method: 'GET',
			path: '/v1/channels/constraints',
		});
	});

	it('blocks unauthenticated GET /v1/channels/audiences', async () => {
		await assertUnauthenticatedRequestBlocked(baseUrl, {
			method: 'GET',
			path: '/v1/channels/audiences',
		});
	});
});

describe('/v1/channels permissions', () => {
	it('blocks GET /v1/channels/constraints without the dispatch permission', async () => {
		await assertInsufficientPermissionsRequestBlocked(baseUrl, {
			method: 'GET',
			path: '/v1/channels/constraints',
		});
	});

	it('blocks GET /v1/channels/audiences without the dispatch permission', async () => {
		await assertInsufficientPermissionsRequestBlocked(baseUrl, {
			method: 'GET',
			path: '/v1/channels/audiences',
		});
	});
});

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
		expect(push.audience.maxTopics).toBe(MAX_APP_PUSH_TOPICS);
	});

	it('exposes the newsletter content limits and subject limit', async () => {
		const response = await getConstraints();
		const body = (await response.json()) as typeof channelConstraints;

		const newsletter = body.channels[NotificationChannel.Newsletter];

		expect(newsletter.content).toEqual(
			notificationChannelContentLimits[NotificationChannel.Newsletter],
		);
		expect(newsletter.compose.subject).toEqual(
			notificationChannelContentLimits[NotificationChannel.Newsletter].title,
		);
		expect(newsletter.compose.minItems).toBe(1);
		expect(newsletter.compose.maxItems).toBe(1);
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

	it('exposes every push topic type with its editions, id and label only', async () => {
		const response = await getAudiences();
		const body = (await response.json()) as typeof channelAudiences;

		expect(
			body.channels[NotificationChannel.AppPushNotification]
				.topicTypes as unknown,
		).toEqual(
			Object.entries(appPushTopicTypes).map(([id, { label, editions }]) => ({
				id,
				label,
				editions: Object.entries(editions).map(([editionId, edition]) => ({
					id: editionId,
					label: edition.label,
				})),
			})),
		);
	});

	it('exposes only the id and label of every newsletter segment', async () => {
		const response = await getAudiences();
		const body = (await response.json()) as typeof channelAudiences;

		expect(body.channels[NotificationChannel.Newsletter].segments).toEqual(
			Object.entries(newsletterSegments).map(([id, { label }]) => ({
				id: id as NewsletterSegmentId,
				label,
			})),
		);
	});

	it('does not leak downstream addressing (campaign/topic)', async () => {
		const response = await getAudiences();
		const body = (await response.json()) as typeof channelAudiences;

		for (const segment of body.channels[NotificationChannel.Newsletter]
			.segments) {
			expect(Object.keys(segment).sort()).toEqual(['id', 'label']);
		}

		for (const topicType of body.channels[
			NotificationChannel.AppPushNotification
		].topicTypes) {
			expect(Object.keys(topicType).sort()).toEqual([
				'editions',
				'id',
				'label',
			]);
			for (const edition of topicType.editions) {
				expect(Object.keys(edition).sort()).toEqual(['id', 'label']);
			}
		}
	});
});
