import { describe, expect, it } from 'bun:test';
import {
	appAlertFormSchema,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
	newsletterFormSchema,
	validateNewsletterPreview,
} from './notification-forms';

describe('notification form length rules', () => {
	it('accepts a newsletter subject and preview of any length', () => {
		const result = newsletterFormSchema.safeParse({
			...defaultNewsletterFormValues,
			kicker: 'exclusive',
			subject: 'a'.repeat(500),
			preview: 'b'.repeat(500),
			audienceSegments: ['UK'],
		});

		expect(result.success).toBe(true);
	});

	it('accepts an app-alert headline of any length', () => {
		const result = appAlertFormSchema.safeParse({
			...defaultAppAlertFormValues,
			headline: 'a'.repeat(500),
			editions: ['UK'],
		});

		expect(result.success).toBe(true);
	});

	it('still requires each text field to be present', () => {
		expect(
			newsletterFormSchema.safeParse({
				...defaultNewsletterFormValues,
				subject: '   ',
				preview: 'Preview',
				audienceSegments: ['UK'],
			}).success,
		).toBe(false);

		expect(
			appAlertFormSchema.safeParse({
				...defaultAppAlertFormValues,
				headline: '   ',
				editions: ['UK'],
			}).success,
		).toBe(false);
	});

	it('requires preview text only when preview is shown', () => {
		expect(validateNewsletterPreview('   ', true)).toBe(
			'Preview text is required',
		);

		expect(validateNewsletterPreview('   ', false)).toBeUndefined();
		expect(validateNewsletterPreview('Preview', true)).toBeUndefined();
	});

	it('validates preview text on submit when show preview is enabled', () => {
		expect(
			newsletterFormSchema.safeParse({
				...defaultNewsletterFormValues,
				subject: 'Subject',
				preview: '   ',
				showPreview: true,
				audienceSegments: ['UK'],
			}).success,
		).toBe(false);

		expect(
			newsletterFormSchema.safeParse({
				...defaultNewsletterFormValues,
				subject: 'Subject',
				preview: '   ',
				showPreview: false,
				audienceSegments: ['UK'],
			}).success,
		).toBe(true);
	});
});
