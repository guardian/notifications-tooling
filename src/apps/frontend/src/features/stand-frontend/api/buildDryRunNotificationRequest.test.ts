import { describe, expect, it } from 'bun:test';
import type { NotificationDraft } from '../useNotificationDraft';
import { buildDryRunNotificationRequest } from './buildDryRunNotificationRequest';

describe('buildDryRunNotificationRequest', () => {
	it('maps the current newsletter draft to the backend dry-run contract', () => {
		const draft: NotificationDraft = {
			articleUrl:
				'https://www.theguardian.com/world/2026/jul/22/example-article',
			kicker: 'breaking-news',
			subject: 'Example subject',
			previewText: 'Example preview text',
		};

		expect(
			buildDryRunNotificationRequest(
				'11111111-1111-4111-8111-111111111111',
				draft,
			),
		).toEqual({
			idempotencyKey: '11111111-1111-4111-8111-111111111111',
			category: 'editorial',
			priority: 'standard',
			content: {
				items: {
					'lead-story': {
						type: 'newsletter',
						title: 'Example subject',
						body: 'Example preview text',
						link: 'https://www.theguardian.com/world/2026/jul/22/example-article',
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
						subject: 'Example subject',
					},
				},
			},
			sender: 'editorial-breaking-news',
			options: {
				dryRun: true,
				scheduledFor: null,
			},
		});
	});
});
