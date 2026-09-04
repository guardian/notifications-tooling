import { displayAppAlertTopicEditionId, newsletterSegmentId } from '@models';
import { z } from 'zod';
import { kickerSchema } from './api/schemas';

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
	alertType: z.enum([
		'breaking-news',
		'sport',
		'editors-picks',
		'one-not-to-miss',
	]),
	headline: z.string().trim().min(1, 'Headline is required'),
	editions: z
		.array(displayAppAlertTopicEditionId)
		.min(1, 'Please select an edition'),
	includeThumbnail: z.boolean(),
	articleThumbnailUrl: z
		.union([
			z.literal(''),
			z
				.string()
				.url()
				.refine(
					(url) =>
						/^(https?:\/\/)(media\.guim\.co\.uk|i\.guim\.co\.uk)\//.test(url),
					{ message: 'Please enter a valid Guardian image URL' },
				),
		])
		.optional(),
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
	articleThumbnailUrl: '',
	deliveryOption: 'appImmediate',
};
