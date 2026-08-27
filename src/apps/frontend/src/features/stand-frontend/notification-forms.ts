import { appAlertTopicEditionId, newsletterSegmentId } from '@models';
import { z } from 'zod';
import { kickerSchema } from './api/schemas';
import {
	APP_ALERT_LIMIT_FALLBACKS,
	NEWSLETTER_LIMIT_FALLBACKS,
} from './api/useChannelConstraints';
import { composeNewsletterSubject } from './newsletter-subject';

interface NewsletterFormLimits {
	subject: number;
	preview: number;
}

interface AppAlertFormLimits {
	headline: number;
}

export const createNewsletterFormSchema = ({
	subject: subjectLimit,
	preview: previewLimit,
}: NewsletterFormLimits) =>
	z
		.object({
			kicker: kickerSchema,
			subject: z.string().trim().min(1, 'Subject is required'),
			preview: z
				.string()
				.trim()
				.min(1, 'Preview text is required')
				.max(
					previewLimit,
					`Preview text must be ${previewLimit} characters or fewer`,
				),
			audienceSegments: z
				.array(newsletterSegmentId)
				.min(1, 'Please select an audience segment'),
			deliveryOption: z.literal('immediate'),
		})
		.superRefine(({ kicker, subject }, context) => {
			const composedSubject = composeNewsletterSubject(subject, kicker);
			if (composedSubject.length > subjectLimit) {
				context.addIssue({
					code: 'custom',
					path: ['subject'],
					message: `Subject must be ${subjectLimit} characters or fewer including the kicker`,
				});
			}
		});

export const createAppAlertFormSchema = ({
	headline: headlineLimit,
}: AppAlertFormLimits) =>
	z.object({
		alertType: z.enum([
			'breaking-news',
			'sport',
			'editors-picks',
			'one-not-to-miss',
		]),
		headline: z
			.string()
			.trim()
			.min(1, 'Headline is required')
			.max(
				headlineLimit,
				`Headline must be ${headlineLimit} characters or fewer`,
			),
		editions: z
			.array(appAlertTopicEditionId)
			.min(1, 'Please select an edition'),
		deliveryOption: z.literal('appImmediate'),
	});

export const newsletterFormSchema = createNewsletterFormSchema({
	subject: NEWSLETTER_LIMIT_FALLBACKS.title.validationCap,
	preview: NEWSLETTER_LIMIT_FALLBACKS.body.validationCap,
});

export const appAlertFormSchema = createAppAlertFormSchema({
	headline: APP_ALERT_LIMIT_FALLBACKS.headline.validationCap,
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
	deliveryOption: 'appImmediate',
};
