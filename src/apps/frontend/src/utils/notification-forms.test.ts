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
			alertType: 'breaking-news',
			headline: 'a'.repeat(500),
			editions: ['UK'],
		});

		expect(result.success).toBe(true);
	});

	it('accepts an empty or valid app-alert thumbnail URL', () => {
		const values = {
			...defaultAppAlertFormValues,
			alertType: 'breaking-news',
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

	it('starts without a kicker and requires one on submit', () => {
		expect(defaultNewsletterEmailFormValues.kicker).toBe('');

		const result = newsletterEmailFormSchema.safeParse({
			...defaultNewsletterEmailFormValues,
			subjectText: 'Subject',
			previewText: 'Preview',
			audienceSegments: ['UK'],
		});

		expect(
			result.error?.issues.find(({ path }) => path[0] === 'kicker')?.message,
		).toBe('Please select a kicker');
	});

	it('starts without an alert type and requires one on submit', () => {
		expect(defaultAppAlertFormValues.alertType).toBe('');

		const result = appAlertFormSchema.safeParse({
			...defaultAppAlertFormValues,
			headline: 'A developing story',
			editions: ['UK'],
		});

		expect(
			result.error?.issues.find(({ path }) => path[0] === 'alertType')?.message,
		).toBe('Please select an alert type');
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
				kicker: 'none',
				subjectText: 'Subject',
				previewText: '   ',
				showPreview: true,
				audienceSegments: ['UK'],
			}).success,
		).toBe(false);

		expect(
			newsletterEmailFormSchema.safeParse({
				...defaultNewsletterEmailFormValues,
				kicker: 'none',
				subjectText: 'Subject',
				previewText: '   ',
				showPreview: false,
				audienceSegments: ['UK'],
			}).success,
		).toBe(true);
	});

	it('reports required text errors against the renamed form fields', () => {
		const result = newsletterEmailFormSchema.safeParse({
			...defaultNewsletterEmailFormValues,
			kicker: 'none',
			subjectText: '   ',
			previewText: '   ',
			showPreview: true,
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
