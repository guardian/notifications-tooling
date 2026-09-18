import { describe, expect, it } from 'bun:test';
import { validateGridCropPageUrl } from './grid-url-parsing';

const gridOrigin = 'https://grid.example.com';
const imageId = '0123456789abcdef0123456789abcdef01234567';

describe('validateGridCropPageUrl', () => {
	it('returns no result for an empty URL', () => {
		expect(validateGridCropPageUrl('', gridOrigin)).toEqual({
			success: false,
		});
	});

	it('reports when the grid origin is not configured', () => {
		expect(
			validateGridCropPageUrl(
				`${gridOrigin}/images/${imageId}?crop=100_200_300_400`,
				undefined,
			),
		).toEqual({
			success: false,
			validationError: 'No grid origin URL configured',
		});
	});

	it('rejects URLs from another origin', () => {
		expect(
			validateGridCropPageUrl(
				`https://other.example.com/images/${imageId}?crop=100_200_300_400`,
				gridOrigin,
			),
		).toEqual({
			success: false,
			validationError: 'Please enter a valid Guardian image URL',
		});
	});

	it('rejects malformed URLs', () => {
		expect(validateGridCropPageUrl('not-a-url', gridOrigin)).toEqual({
			success: false,
			validationError: 'Please enter a valid Guardian image URL',
		});
	});

	it('rejects URLs that are not image crop pages', () => {
		expect(
			validateGridCropPageUrl(
				`${gridOrigin}/articles/${imageId}?crop=100_200_300_400`,
				gridOrigin,
			),
		).toEqual({
			success: false,
			validationError: 'Please enter the URL for a 5:4 crop page',
		});
	});

	it('rejects image URLs with an invalid crop parameter', () => {
		expect(
			validateGridCropPageUrl(
				`${gridOrigin}/images/${imageId}?crop=100_200_300`,
				gridOrigin,
			),
		).toEqual({
			success: false,
			validationError: 'Please enter the URL for a 5:4 crop page',
		});
	});

	it('returns the image and crop details for a valid crop page URL', () => {
		expect(
			validateGridCropPageUrl(
				`${gridOrigin}/images/${imageId}?crop=100_200_300_400`,
				gridOrigin,
			),
		).toEqual({
			success: true,
			details: {
				type: 'grid-url',
				cropId: '100_200_300_400',
				imageId,
			},
		});
	});
});
