import { describe, expect, it } from 'bun:test';
import { type BrazeCampaignIds, resolveBrazeCampaignId } from './campaigns';

const campaignIds: BrazeCampaignIds = {
	UK: 'campaign-uk',
	US: 'campaign-us',
	AU: 'campaign-au',
};

describe('resolveBrazeCampaignId', () => {
	it.each([
		['UK', 'campaign-uk'],
		['US', 'campaign-us'],
		['AU', 'campaign-au'],
	] as const)(
		'resolves the %s campaign',
		(audienceSegment, expectedCampaignId) => {
			expect(resolveBrazeCampaignId(audienceSegment, campaignIds)).toBe(
				expectedCampaignId,
			);
		},
	);

	it('rejects an empty campaign ID', () => {
		expect(() =>
			resolveBrazeCampaignId('UK', { ...campaignIds, UK: ' ' }),
		).toThrow('No Braze campaign ID is configured for UK.');
	});
});
