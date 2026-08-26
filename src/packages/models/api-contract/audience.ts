export type NewsletterSegmentId = 'UK' | 'US' | 'AU';

export interface NewsletterSegment {
	label: string;
	brazeCampaignId: string;
	emailRenderingNewsletterId: string;
}
