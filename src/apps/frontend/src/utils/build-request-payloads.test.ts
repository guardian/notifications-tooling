import { describe, expect, it } from 'bun:test';
import { sendNotificationRequestSchema } from '../schemas';
import {
	articleFixture,
	liveblogFixture,
	requestedLiveblogBlock,
} from '../testing/capi-fixtures';
import {
	buildAppAlertRequest,
	buildNewsletterEmailRequest,
} from './build-request-payloads';

describe('notification request builders', () => {
	it.each([
		['breaking-news', 'Breaking news: Edited subject'],
		['exclusive', 'Exclusive: Edited subject'],
		['none', 'Edited subject'],
	] as const)(
		'composes the %s kicker into the subject line, not the subject text',
		(kicker, subjectLine) => {
			const request = buildNewsletterEmailRequest({
				values: {
					kicker,
					subjectText: 'Edited subject',
					previewText: '',
					includePreviewText: false,
					audienceSegments: ['UK'],
					deliveryOption: 'immediate',
				},
				article: articleFixture,
				idempotencyKey: 'newsletter-operation-id',
			});

			expect(request.content.items['lead-story']).toMatchObject({
				title: 'Edited subject',
				body: '',
			});
			expect(request.channels).toMatchObject({
				newsletter: { compose: { subject: subjectLine } },
			});
		},
	);

	it('builds a valid newsletter request with article media', () => {
		const request = buildNewsletterEmailRequest({
			values: {
				kicker: 'exclusive',
				subjectText: 'A developing story',
				previewText: 'What readers need to know.',
				audienceSegments: ['UK', 'AU'],
				deliveryOption: 'immediate',
				includePreviewText: true,
			},
			article: articleFixture,
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
		expect(request.content.items['lead-story']).toMatchObject({
			type: 'newsletter',
			title: 'A developing story',
			body: 'What readers need to know.',
			link: articleFixture.webUrl,
			media: {
				type: 'image',
				imageUrl: articleFixture.fields?.thumbnail,
				thumbnailUrl: articleFixture.fields?.thumbnail,
			},
		});
	});

	it('builds a valid app-push request with mapped editions and media', () => {
		const request = buildAppAlertRequest({
			values: {
				alertType: 'breaking-news',
				headline: 'A developing story',
				editions: ['UK', 'EU', 'INT'],
				includeThumbnail: true,
				articleThumbnailUrl: articleFixture.fields?.thumbnail ?? '',
				deliveryOption: 'appImmediate',
			},
			alertTypeLabel: 'Breaking news',
			article: articleFixture,
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
			title: 'Breaking news',
			body: 'A developing story',
			media: {
				type: 'image',
				imageUrl: articleFixture.fields?.thumbnail,
				thumbnailUrl: articleFixture.fields?.thumbnail,
			},
		});
	});
	it('uses a replacement thumbnail URL in app-push media', () => {
		const replacementThumbnailUrl =
			'https://media.guim.co.uk/replacement-thumbnail.jpg';
		const request = buildAppAlertRequest({
			values: {
				alertType: 'breaking-news',
				headline: 'A developing story',
				editions: ['UK'],
				includeThumbnail: true,
				articleThumbnailUrl: replacementThumbnailUrl,
				deliveryOption: 'appImmediate',
			},
			alertTypeLabel: 'Breaking news',
			article: articleFixture,
			idempotencyKey: 'app-alert-with-replacement-thumbnail',
		});

		expect(request.content.items['lead-story']).toMatchObject({
			media: {
				imageUrl: replacementThumbnailUrl,
				thumbnailUrl: replacementThumbnailUrl,
			},
		});
	});

	it('uses a liveblog main-block image when the thumbnail field is absent', () => {
		const request = buildAppAlertRequest({
			values: {
				alertType: 'breaking-news',
				headline: 'Latest developments',
				editions: ['UK'],
				includeThumbnail: true,
				articleThumbnailUrl: '',
				deliveryOption: 'appImmediate',
			},
			alertTypeLabel: 'Breaking news',
			article: {
				...liveblogFixture,
				fields: {
					headline: liveblogFixture.fields?.headline ?? 'Latest developments',
					lastModified: liveblogFixture.fields?.lastModified ?? '',
				},
			},
			idempotencyKey: 'liveblog-app-alert-operation-id',
		});

		expect(request.content.items['lead-story']).toMatchObject({
			media: {
				type: 'image',
				imageUrl:
					'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
				thumbnailUrl:
					'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
			},
		});
	});

	it('uses the main liveblog image and exact requested-block deep link', () => {
		const requestedUrl = `${liveblogFixture.webUrl}?filterKeyEvents=false#${requestedLiveblogBlock.id}`;
		const request = buildAppAlertRequest({
			values: {
				alertType: 'breaking-news',
				headline: 'Requested liveblog update',
				editions: ['UK'],
				includeThumbnail: true,
				articleThumbnailUrl: '',
				deliveryOption: 'appImmediate',
			},
			alertTypeLabel: 'Breaking news',
			article: liveblogFixture,
			requestedUrl,
			requestedBlock: requestedLiveblogBlock,
			idempotencyKey: 'requested-liveblog-block-operation-id',
		});

		expect(request.content.items['lead-story']).toMatchObject({
			link: requestedUrl,
			media: {
				imageUrl:
					'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
				thumbnailUrl:
					'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
			},
		});
	});

	it('removes app-push media when the thumbnail is disabled', () => {
		const request = buildAppAlertRequest({
			values: {
				alertType: 'breaking-news',
				headline: 'A developing story',
				editions: ['UK'],
				includeThumbnail: false,
				articleThumbnailUrl: articleFixture.fields?.thumbnail ?? '',
				deliveryOption: 'appImmediate',
			},
			alertTypeLabel: 'Breaking news',
			article: articleFixture,
			idempotencyKey: 'app-alert-without-thumbnail',
		});

		expect(request.content.items['lead-story']).not.toHaveProperty('media');
	});

	it('rejects content that does not match the request channel', () => {
		const newsletterEmailRequest = buildNewsletterEmailRequest({
			values: {
				kicker: 'exclusive',
				subjectText: 'A developing story',
				previewText: 'What readers need to know.',
				audienceSegments: ['UK'],
				deliveryOption: 'immediate',
				includePreviewText: true,
			},
			article: articleFixture,
			idempotencyKey: 'newsletter-operation-id',
		});
		const appAlertRequest = buildAppAlertRequest({
			values: {
				alertType: 'breaking-news',
				headline: 'A developing story',
				editions: ['UK'],
				includeThumbnail: false,
				articleThumbnailUrl: articleFixture.fields?.thumbnail ?? '',
				deliveryOption: 'appImmediate',
			},
			alertTypeLabel: 'Breaking news',
			article: articleFixture,
			idempotencyKey: 'app-alert-operation-id',
		});

		expect(
			sendNotificationRequestSchema.safeParse({
				...newsletterEmailRequest,
				content: appAlertRequest.content,
			}).success,
		).toBeFalse();
		expect(
			sendNotificationRequestSchema.safeParse({
				...appAlertRequest,
				content: newsletterEmailRequest.content,
			}).success,
		).toBeFalse();
	});
});
