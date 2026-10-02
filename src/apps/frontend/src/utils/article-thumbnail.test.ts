import { describe, expect, it } from 'bun:test';
import type { ResolvedArticle } from '@models';
import { articleFixture, liveblogFixture } from '../testing/capi-fixtures';
import { getArticleThumbnail } from './article-thumbnail';

describe('getArticleThumbnail', () => {
	it('returns an empty thumbnail when there is no article', () => {
		expect(getArticleThumbnail()).toEqual({
			alt: undefined,
			src: undefined,
		});
	});

	it('uses the thumbnail field for a non-liveblog content', () => {
		const articleWithMainImage: ResolvedArticle = {
			...articleFixture,
			blocks: liveblogFixture.blocks,
		};

		expect(getArticleThumbnail(articleWithMainImage)).toEqual({
			alt: undefined,
			src: articleFixture.fields?.thumbnail,
		});
	});

	it('uses the 500px main image and its alt text for a liveblog', () => {
		expect(getArticleThumbnail(liveblogFixture)).toEqual({
			alt: 'Latest liveblog update',
			src: 'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
		});
	});

	it('falls back to the first image asset with a file when no usable 500px asset exists for a liveblog', () => {
		const liveblogWithoutUsablePreferredAsset: ResolvedArticle = {
			...liveblogFixture,
			blocks: {
				main: {
					elements: [
						{
							type: 'image',
							assets: [
								{
									file: 'https://example.com/1000.jpg',
									typeData: { width: 1000 },
								},
								{ typeData: { width: 1000 } },
							],
						},
					],
				},
			},
		};

		expect(getArticleThumbnail(liveblogWithoutUsablePreferredAsset)).toEqual({
			alt: undefined,
			src: 'https://example.com/1000.jpg',
		});
	});

	it('falls back to the article thumbnail when the liveblog main block has no image element', () => {
		const liveblogWithoutImageAsset: ResolvedArticle = {
			...liveblogFixture,
			blocks: {
				main: {
					elements: [
						{
							type: 'video',
							videoTypeData: {},
							assets: [],
						},
					],
				},
			},
		};

		expect(getArticleThumbnail(liveblogWithoutImageAsset)).toEqual({
			alt: undefined,
			src: liveblogFixture.fields?.thumbnail,
		});
	});
});
