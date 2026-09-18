import { describe, expect, it } from 'bun:test';
import {
	createNotificationPrefillState,
	parseNotificationPrefill,
} from './notification-prefill';

describe('notification prefill state', () => {
	it('round-trips all editable app alert fields', () => {
		const state = createNotificationPrefillState('app-push', {
			articleUrl: 'https://www.theguardian.com/world/example',
			fields: {
				alertType: 'breaking-news',
				headline: 'Override headline',
				editions: ['UK'],
				includeThumbnail: false,
				articleThumbnailUrl: '',
				deliveryOption: 'appImmediate',
			},
		});

		expect(parseNotificationPrefill(state, 'app-push')).toEqual(
			state.notificationPrefill,
		);
	});

	it('round-trips all editable newsletter fields', () => {
		const state = createNotificationPrefillState('newsletter', {
			articleUrl: 'https://www.theguardian.com/world/example',
			fields: {
				kicker: 'exclusive',
				subjectText: 'Override subject',
				previewText: 'Override preview',
				showPreview: true,
				audienceSegments: ['UK'],
				deliveryOption: 'immediate',
			},
		});

		expect(parseNotificationPrefill(state, 'newsletter')).toEqual(
			state.notificationPrefill,
		);
	});

	it('rejects state intended for another channel', () => {
		const state = createNotificationPrefillState('newsletter', {});

		expect(parseNotificationPrefill(state, 'app-push')).toBeUndefined();
	});
});
