import { describe, expect, it } from 'bun:test';
import { getNewsletterSegments } from './audiences';

describe('getNewsletterSegments', () => {
	it('uses CODE values for DEV and CODE', () => {
		expect(getNewsletterSegments('DEV')).toEqual(getNewsletterSegments('CODE'));
		expect(getNewsletterSegments('CODE').UK.brazeCampaignId).toBe(
			'da019800-869e-4e1d-9c2e-029741829af1',
		);
	});
});
