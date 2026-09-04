import { displayAppAlertTopicEditionId, newsletterSegmentId } from '@models';
import { z } from 'zod';
import { kickerSchema } from '../schemas';

/**
 * No length blocks composition: the character counter is guidance and the
 * broker caps nothing an editor can type. These schemas therefore check
 * presence and shape only.
 */
export const newsletterFormSchema = z.object({
	dispatchId: z.string().optional(),
	kicker: kickerSchema,
	subject: z.string().trim().min(1, 'Subject is required'),
	preview: z.string().trim().min(1, 'Preview text is required'),
	audienceSegments: z
		.array(newsletterSegmentId)
		.min(1, 'Please select an audience segment'),
	deliveryOption: z.literal('immediate'),
});

export const appAlertFormSchema = z.object({
	dispatchId: z.string().optional(),
	// The selectable alert types are the topic types the backend exposes via
	// `GET /v1/channels/audiences`, so this cannot be a fixed enum. The select
	// constrains the value to that list, and the broker rejects unknown ids.
	alertType: z.string().min(1, 'Please select an alert type'),
	headline: z.string().trim().min(1, 'Headline is required'),
	editions: z
		.array(displayAppAlertTopicEditionId)
		.min(1, 'Please select an edition'),
	includeThumbnail: z.boolean(),
	deliveryOption: z.literal('appImmediate'),
});

export type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;
export type AppAlertFormValues = z.infer<typeof appAlertFormSchema>;

export const defaultNewsletterFormValues: NewsletterFormValues = {
	kicker: 'breaking-news',
	subject: '',
	preview: '',
	audienceSegments: [],
	deliveryOption: 'immediate',
};

export const defaultAppAlertFormValues: AppAlertFormValues = {
	alertType: 'breaking-news',
	headline: '',
	editions: [],
	includeThumbnail: true,
	deliveryOption: 'appImmediate',
};
