import { describe, expect, it } from 'bun:test';
import {
	generateBrazeEmailRequest,
	MAX_BRAZE_TRIGGER_PROPERTIES_BYTES,
} from './generate-request';

describe('generateBrazeEmailRequest', () => {
	it('generates a broadcast campaign trigger with rendered email content', () => {
		const request = generateBrazeEmailRequest({
			campaignId: 'campaign-123',
			html: '<html><body>Breaking news</body></html>',
			subject: 'Breaking news: An important story',
		});

		expect(request).toEqual({
			broadcast: true,
			campaign_id: 'campaign-123',
			trigger_properties: {
				body: '<html><body>Breaking news</body></html>',
				subject: 'Breaking news: An important story',
			},
		});
	});

	it('preserves Unicode content', () => {
		const request = generateBrazeEmailRequest({
			campaignId: 'campaign-123',
			html: '<p>Résumé of today’s news</p>',
			subject: 'Today’s briefing',
		});

		expect(request.trigger_properties).toEqual({
			body: '<p>Résumé of today’s news</p>',
			subject: 'Today’s briefing',
		});
	});

	it('rejects trigger properties over the Braze size limit', () => {
		expect(() =>
			generateBrazeEmailRequest({
				campaignId: 'campaign-123',
				html: 'a'.repeat(MAX_BRAZE_TRIGGER_PROPERTIES_BYTES),
				subject: 'Breaking news',
			}),
		).toThrow('Braze trigger properties exceed the 50000-byte limit');
	});
});
