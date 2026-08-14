export const emailChannelConfigExample = {
	summary: 'email Channel Config example',
	value: {
		UK: {
			label: 'UK',
			brazeCampaignId: 'da019800-869e-4e1d-9c2e-029741829af1',
			emailRenderingNewsletterId: 'breaking-news-uk',
		},
		US: {
			label: 'US',
			brazeCampaignId: 'a945e3ae-165b-46d7-b163-0ca1c6beb2f4',
			emailRenderingNewsletterId: 'breakingnewsus',
		},
		AU: {
			label: 'AU',
			brazeCampaignId: '5da1b754-42f4-440d-9eec-0d595190a0f0',
			emailRenderingNewsletterId: 'breaking-news-au',
		},
	},
} as const;
