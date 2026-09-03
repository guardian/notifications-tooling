import { describe, expect, it } from 'bun:test';
import {
	appAlertFormSchema,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
	newsletterFormSchema,
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

	it('accepts an empty or valid app-alert thumbnail URL', () => {
		const values = {
			...defaultAppAlertFormValues,
			headline: 'A developing story',
			editions: ['UK'] as const,
		};

		expect(appAlertFormSchema.safeParse(values).success).toBe(true);
		expect(
			appAlertFormSchema.safeParse({
				...values,
				articleThumbnailUrl:
					'https://media.guim.co.uk/replacement-thumbnail.jpg',
			}).success,
		).toBe(true);
	});

	it('rejects an invalid app-alert thumbnail URL', () => {
		expect(
			appAlertFormSchema.safeParse({
				...defaultAppAlertFormValues,
				headline: 'A developing story',
				editions: ['UK'],
				articleThumbnailUrl: 'not a URL',
			}).success,
		).toBe(false);
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
});
