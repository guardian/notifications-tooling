import { describe, expect, it } from 'bun:test';
import {
	appAlertFormSchema,
	defaultAppAlertFormValues,
	defaultNewsletterEmailFormValues,
	newsletterEmailFormSchema,
	validateNewsletterEmailPreviewText,
} from './notification-forms';

describe('notification form length rules', () => {
	it('accepts a newsletter subject and preview of any length', () => {
		const result = newsletterEmailFormSchema.safeParse({
			...defaultNewsletterEmailFormValues,
			kicker: 'exclusive',
			subjectText: 'a'.repeat(500),
			previewText: 'b'.repeat(500),
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
		expect(
			appAlertFormSchema.safeParse({
				...values,
				articleThumbnailUrl: 'https://i.guim.co.uk/img/media/image-id.jpg',
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
		expect(
			appAlertFormSchema.safeParse({
				...defaultAppAlertFormValues,
				headline: 'A developing story',
				editions: ['UK'],
				articleThumbnailUrl: 'https://www.theguardian.com/news/image.jpg',
			}).success,
		).toBe(false);
		expect(
			appAlertFormSchema.safeParse({
				...defaultAppAlertFormValues,
				headline: 'A developing story',
				editions: ['UK'],
				articleThumbnailUrl: 'ftp://media.guim.co.uk/replacement-thumbnail.jpg',
			}).success,
		).toBe(false);
		expect(
			appAlertFormSchema.safeParse({
				...defaultAppAlertFormValues,
				headline: 'A developing story',
				editions: ['UK'],
				articleThumbnailUrl: 'https://media.guim.co.uk',
			}).success,
		).toBe(false);
	});

	it('still requires each text field to be present', () => {
		expect(
			newsletterEmailFormSchema.safeParse({
				...defaultNewsletterEmailFormValues,
				subjectText: '   ',
				previewText: 'Preview',
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

	it('requires preview text only when it is included', () => {
		expect(validateNewsletterEmailPreviewText('   ', true)).toBe(
			'Preview text is required',
		);

		expect(validateNewsletterEmailPreviewText('   ', false)).toBeUndefined();
		expect(validateNewsletterEmailPreviewText('Preview', true)).toBeUndefined();
	});

	it('validates preview text on submit when inclusion is enabled', () => {
		expect(
			newsletterEmailFormSchema.safeParse({
				...defaultNewsletterEmailFormValues,
				subjectText: 'Subject',
				previewText: '   ',
				includePreviewText: true,
				audienceSegments: ['UK'],
			}).success,
		).toBe(false);

		expect(
			newsletterEmailFormSchema.safeParse({
				...defaultNewsletterEmailFormValues,
				subjectText: 'Subject',
				previewText: '   ',
				includePreviewText: false,
				audienceSegments: ['UK'],
			}).success,
		).toBe(true);
	});

	it('reports required text errors against the renamed form fields', () => {
		const result = newsletterEmailFormSchema.safeParse({
			...defaultNewsletterEmailFormValues,
			subjectText: '   ',
			previewText: '   ',
			includePreviewText: true,
			audienceSegments: ['UK'],
		});

		expect(result.success).toBe(false);
		expect(
			result.error?.issues.map(({ path, message }) => ({ path, message })),
		).toEqual([
			{ path: ['subjectText'], message: 'Subject is required' },
			{ path: ['previewText'], message: 'Preview text is required' },
		]);
	});
});
