export const AUDIENCE_SEGMENTS = ['UK', 'US', 'AU'] as const;

// Product-level audience identifiers, not Braze segment IDs. Each one maps to
// a separate Braze campaign whose target audience is configured in Braze.
export type AudienceSegment = (typeof AUDIENCE_SEGMENTS)[number];

export type BrazeCampaignIds = Record<AudienceSegment, string>;

export const resolveBrazeCampaignId = (
	audienceSegment: AudienceSegment,
	campaignIds: BrazeCampaignIds,
): string => {
	const campaignId = campaignIds[audienceSegment].trim();

	if (!campaignId) {
		throw new Error(
			`No Braze campaign ID is configured for ${audienceSegment}.`,
		);
	}

	return campaignId;
};
