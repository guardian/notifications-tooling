import type { Schema } from 'zod';
import z from 'zod';

function filterInvalidMembers<T>(
	schema: Schema<T>,
	warning = 'invalid member of array filtered out',
) {
	return (val: unknown) => {
		if (schema.array().safeParse(val).success) {
			return val;
		}
		if (!Array.isArray(val)) {
			return val;
		}
		const filtered = val.flatMap((member) => {
			const parseMember = schema.safeParse(member);
			if (!parseMember.success) {
				console.warn(warning, member);
				return [];
			}
			return parseMember.data;
		});
		return filtered;
	};
}

// FIX ME: Do we need a separate enum for newsletter segments, or can this be the same
// as app alert topics?
// We happen not to be using 'EU' and 'INT' for newsletters, but that's just the current
// config rather than a hard rule.
export const newsletterSegmentId = z.enum(['UK', 'US', 'AU']);
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

// FIX ME: we use the FrontendAppAlertTopicEditionId to reference the
// editions in the frontend, but the data from the backend keys the topic editions
// on the AppAlertTopicEditionId, so we need to convert the string in a number of
// places.
// The keys used in the audience data could be changed to align to FrontendAppAlertTopicEditionId
// which would simplify a lot of the modeling and frontend code
// see: src/packages/config/audiences.ts
export const frontendAppAlertTopicEditionId = z.enum([
	'UK',
	'US',
	'AU',
	'EU',
	'INT',
]);
export type DisplayAppAlertTopicEditionId = z.infer<
	typeof frontendAppAlertTopicEditionId
>;
export const appAlertTopicEditionId = z.enum([
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
	editions: z.preprocess(
		// if the editions contain invalid members, filter those out rather than failing the whole response
		filterInvalidMembers(
			topicTypeEditionOptionSchema,
			'invalid app alert topic edition option filtered out',
		),
		topicTypeEditionOptionSchema.array(),
	),
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
					segments: z.preprocess(
						filterInvalidMembers(
							newsletterEditionOptionSchema,
							'invalid newsletter edition option filtered out',
						),
						z.array(newsletterEditionOptionSchema),
					),
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

// FIX ME - if we change the audience API data to use the
// DisplayAppAlertTopicEditionId format for edition keys,
// these functions won't be needed
const topicIdToDisplayIdMap: Record<
	AppAlertTopicEditionId,
	DisplayAppAlertTopicEditionId
> = {
	uk: 'UK',
	us: 'US',
	au: 'AU',
	europe: 'EU',
	international: 'INT',
} as const;

const displayIdToTopicIdMap: Record<
	DisplayAppAlertTopicEditionId,
	AppAlertTopicEditionId
> = {
	UK: 'uk',
	US: 'us',
	AU: 'au',
	EU: 'europe',
	INT: 'international',
} as const;

export const toDisplayEditionId = (
	id: AppAlertTopicEditionId,
): DisplayAppAlertTopicEditionId => {
	return topicIdToDisplayIdMap[id];
};

export const toApiEditionId = (
	id: DisplayAppAlertTopicEditionId,
): AppAlertTopicEditionId => {
	return displayIdToTopicIdMap[id];
};
