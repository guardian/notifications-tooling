import { describe, expect, it } from 'bun:test';
import {
	createAppAlertFormSchema,
	createNewsletterFormSchema,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
} from './notification-forms';

describe('notification form hard limits', () => {
	const newsletterSchema = createNewsletterFormSchema({
		subject: 20,
		preview: 10,
	});
	const appAlertSchema = createAppAlertFormSchema({ headline: 10 });

	it('counts the kicker as part of the newsletter subject limit', () => {
		const result = newsletterSchema.safeParse({
			...defaultNewsletterFormValues,
			kicker: 'exclusive',
			subject: '123456789',
			preview: 'Preview',
			audienceSegments: ['UK'],
		});

		expect(result.success).toBe(true);
		expect(
			newsletterSchema.safeParse({
				...defaultNewsletterFormValues,
				kicker: 'exclusive',
				subject: '1234567890',
				preview: 'Preview',
				audienceSegments: ['UK'],
			}).success,
		).toBe(false);
	});

	it('rejects newsletter preview text over its hard limit', () => {
		const result = newsletterSchema.safeParse({
			...defaultNewsletterFormValues,
			kicker: 'none',
			subject: 'Subject',
			preview: '12345678901',
			audienceSegments: ['UK'],
		});

		expect(result.success).toBe(false);
	});

	it('rejects app-alert headlines over their hard limit', () => {
		const result = appAlertSchema.safeParse({
			...defaultAppAlertFormValues,
			headline: '12345678901',
			editions: ['UK'],
		});

		expect(result.success).toBe(false);
	});
});
