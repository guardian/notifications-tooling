import { describe, expect, it } from 'bun:test';
import { articleFixture } from '../../mocks/capi-fixtures';
import { sendNotificationRequestSchema } from './api/schemas';
import {
	buildAppAlertRequest,
	buildNewsletterRequest,
} from './build-request-payloads';

describe('notification request builders', () => {
	it('builds a valid newsletter request from form values', () => {
		const request = buildNewsletterRequest({
			values: {
				kicker: 'exclusive',
				subject: 'A developing story',
				preview: 'What readers need to know.',
				audienceSegments: ['UK', 'AU'],
				deliveryOption: 'immediate',
			},
			content: articleFixture,
			idempotencyKey: 'newsletter-operation-id',
		});

		expect(sendNotificationRequestSchema.parse(request)).toEqual(request);
		expect(request.channels).toEqual({
			newsletter: {
				audience: { type: 'segment', items: ['UK', 'AU'] },
				compose: {
					items: ['lead-story'],
					subject: 'Exclusive: A developing story',
				},
			},
		});
	});

	it('builds a valid app-push request with mapped editions and media', () => {
		const request = buildAppAlertRequest({
			values: {
				alertType: 'breaking-news',
				headline: 'A developing story',
				editions: ['UK', 'EU', 'INT'],
				deliveryOption: 'appImmediate',
			},
			content: articleFixture,
			idempotencyKey: 'app-alert-operation-id',
		});

		expect(sendNotificationRequestSchema.parse(request)).toEqual(request);
		expect(request.channels).toEqual({
			'app-push': {
				audience: {
					type: 'topic',
					items: [
						{ type: 'breaking-news', name: 'uk' },
						{ type: 'breaking-news', name: 'europe' },
						{ type: 'breaking-news', name: 'international' },
					],
				},
				compose: { use: 'lead-story' },
			},
		});
		expect(request.content.items['lead-story']).toMatchObject({
			type: 'app-push',
			title: 'Breaking News',
			body: 'A developing story',
			media: {
				type: 'image',
				imageUrl: articleFixture.fields?.thumbnail,
				thumbnailUrl: articleFixture.fields?.thumbnail,
			},
		});
	});
});
