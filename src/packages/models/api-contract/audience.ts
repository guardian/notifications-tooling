import z from 'zod';

const newsletterSegmentId = z.enum(['UK', 'US', 'AU']);
export type NewsletterSegmentId = z.infer<typeof newsletterSegmentId>;
export interface NewsletterSegment {
	label: string;
	brazeCampaignId: string;
	emailRenderingNewsletterId: string;
}
const newsletterEditionOptionSchema = z.object({
	id: newsletterSegmentId,
	label: z.string(),
});
export type NewsletterEditionOption = z.infer<
	typeof newsletterEditionOptionSchema
>;

const appAlertTopicEditionId = z.enum([
	'uk',
	'us',
	'au',
	'europe',
	'international',
]);
export type AppAlertTopicEditionId = z.infer<typeof appAlertTopicEditionId>;
const topicTypeEditionOptionSchema = z.object({
	id: appAlertTopicEditionId,
	label: z.string(),
});
export type TopicTypeEditionOption = z.infer<
	typeof topicTypeEditionOptionSchema
>;
const appAlertTopicOptionSchema = z.object({
	id: z.string(),
	label: z.string(),
	editions: topicTypeEditionOptionSchema.array(),
});
export type AppAlertTopicOption = z.infer<typeof appAlertTopicOptionSchema>;

/**
 * `GET /v1/channels/audiences`. Non-strict throughout, so the backend can add
 * a channel, a field, or an audience cap without breaking a deployed SPA — the
 * client only fails on something it asked for going missing or changing type.
 */
export const channelAudienceResponseSchema = z.object({
	channels: z
		.object({
			newsletter: z
				.object({
					segments: z.array(newsletterEditionOptionSchema),
				})
				.loose(),
			'app-push': z
				.object({
					topicTypes: appAlertTopicOptionSchema.array(),
				})
				.loose(),
		})
		.loose(),
});
export type ChannelAudienceResponse = z.infer<
	typeof channelAudienceResponseSchema
>;
