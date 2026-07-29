import { describe, expect, it } from 'bun:test';
import {
	type SendNotificationRequest,
	sendNotificationRequestSchema,
	sendNotificationResponseSchema,
} from './schemas';

const validEnvelope: SendNotificationRequest = {
	idempotencyKey: '11111111-1111-4111-8111-111111111111',
	content: {
		items: {
			'lead-story': {
				type: 'newsletter',
				title: 'Breaking news',
				body: 'Preview text',
				link: 'https://www.theguardian.com/world/2026/jul/22/example',
			},
		},
	},
	channels: {
		newsletter: {
			audience: {
				type: 'segment',
				items: ['editorial-breaking-news'],
			},
			compose: {
				items: ['lead-story'],
				subject: 'Breaking news',
			},
		},
	},
	sender: 'editorial-breaking-news',
	options: { dryRun: true, scheduledFor: null },
};

describe('sendNotificationRequestSchema', () => {
	it('accepts the newsletter dry-run envelope', () => {
		expect(sendNotificationRequestSchema.parse(validEnvelope)).toEqual(
			validEnvelope,
		);
	});
});

describe('sendNotificationResponseSchema', () => {
	it('parses an accepted response', () => {
		const response = {
			notificationId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
			status: 'accepted' as const,
			plans: [
				{
					channel: 'newsletter' as const,
					planId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee#newsletter',
					status: 'accepted' as const,
				},
			],
			statusUrl:
				'/v1/notifications/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/status',
			cancellable: {
				cancelUrl:
					'/v1/notifications/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/cancel',
				expiresAt: 1_753_200_000,
			},
		};

		expect(sendNotificationResponseSchema.parse(response)).toEqual(response);
	});
});
