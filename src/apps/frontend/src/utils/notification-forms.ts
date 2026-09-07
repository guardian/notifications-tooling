import { displayAppAlertTopicEditionId, newsletterSegmentId } from '@models';
import { z } from 'zod';
import { kickerSchema } from '../schemas';

/**
 * No length blocks composition: the character counter is guidance and the
 * broker caps nothing an editor can type. These schemas therefore check
 * presence and shape only.
 */
export const newsletterFormSchema = z
	.object({
		dispatchId: z.string().optional(),
		kicker: kickerSchema,
		subject: z.string().trim().min(1, 'Subject is required'),
		preview: z.string().trim(),
		showPreview: z.boolean(),
		audienceSegments: z
			.array(newsletterSegmentId)
			.min(1, 'Please select an audience segment'),
		deliveryOption: z.literal('immediate'),
	})
	.superRefine(({ preview, showPreview }, context) => {
		const previewError = validateNewsletterPreview(preview, showPreview);

		if (previewError) {
			context.addIssue({
				code: 'custom',
				message: previewError,
				path: ['preview'],
			});
		}
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
	deliveryOption: z.literal('appImmediate'),
});

export type NewsletterFormValues = z.infer<typeof newsletterFormSchema>;
export type AppAlertFormValues = z.infer<typeof appAlertFormSchema>;

export const validateNewsletterPreview = (
	preview: NewsletterFormValues['preview'],
	showPreview: boolean,
) => {
	if (showPreview && preview.trim().length === 0) {
		return 'Preview text is required';
	}

	return undefined;
};

export const defaultNewsletterFormValues: NewsletterFormValues = {
	kicker: 'breaking-news',
	subject: '',
	preview: '',
	showPreview: true,
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
