import { displayAppAlertTopicEditionId, newsletterSegmentId } from '@models';
import { z } from 'zod';
import { kickerSchema } from '../schemas';
import {
	guardianImageUrlValidationMessage,
	validateGuardianImageUrl,
} from './form-validation';

/**
 * No length blocks composition: the character counter is guidance and the
 * broker caps nothing an editor can type. These schemas therefore check
 * presence and shape only.
 */
export const newsletterEmailFormSchema = z
	.object({
		notificationId: z.string().optional(),
		kicker: z
			.union([kickerSchema, z.literal('')])
			.refine((kicker): boolean => kicker !== '', 'Please select a kicker'),
		subjectText: z.string().trim().min(1, 'Subject is required'),
		previewText: z.string().trim(),
		showPreview: z.boolean(),
		audienceSegments: z
			.array(newsletterSegmentId)
			.min(1, 'Please select an audience segment'),
		deliveryOption: z.literal('immediate'),
	})
	.superRefine(({ previewText, showPreview }, context) => {
		const previewTextError = validateNewsletterEmailPreviewText(
			previewText,
			showPreview,
		);

		if (previewTextError) {
			context.addIssue({
				code: 'custom',
				message: previewTextError,
				path: ['previewText'],
			});
		}
	});

export const appAlertFormSchema = z.object({
	notificationId: z.string().optional(),
	// The selectable alert types are the topic types the backend exposes via
	// `GET /v1/channels/audiences`, so this cannot be a fixed enum. The select
	// constrains the value to that list, and the broker rejects unknown ids.
	alertType: z
		.string()
		.refine(
			(alertType): boolean => alertType !== '',
			'Please select an alert type',
		),
	headline: z.string().trim().min(1, 'Headline is required'),
	editions: z
		.array(displayAppAlertTopicEditionId)
		.min(1, 'Please select an edition'),
	includeThumbnail: z.boolean(),
	replacementImageUrl: z.string(),
	articleThumbnailUrl: z
		.string()
		.refine((url) => !validateGuardianImageUrl(url), {
			message: guardianImageUrlValidationMessage,
		})
		.optional(),
	deliveryOption: z.literal('appImmediate'),
});

export type NewsletterEmailFormValues = z.infer<
	typeof newsletterEmailFormSchema
>;
export type AppAlertFormValues = z.infer<typeof appAlertFormSchema>;

export const validateNewsletterEmailPreviewText = (
	previewText: NewsletterEmailFormValues['previewText'],
	showPreview: boolean,
) => {
	if (showPreview && previewText.trim().length === 0) {
		return 'Preview text is required';
	}

	return undefined;
};

export const defaultNewsletterEmailFormValues: NewsletterEmailFormValues = {
	kicker: '',
	subjectText: '',
	previewText: '',
	showPreview: true,
	audienceSegments: [],
	deliveryOption: 'immediate',
};

export const defaultAppAlertFormValues: AppAlertFormValues = {
	alertType: '',
	headline: '',
	editions: [],
	includeThumbnail: true,
	replacementImageUrl: '',
	articleThumbnailUrl: '',
	deliveryOption: 'appImmediate',
};
