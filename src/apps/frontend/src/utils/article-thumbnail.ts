import type { ResolvedArticle } from '@models';

interface ArticleThumbnail {
	alt?: string;
	src?: string;
}

export const getArticleThumbnail = (
	article?: ResolvedArticle,
): ArticleThumbnail => {
	const image = article?.blocks?.main?.elements?.find(
		({ type }) => type === 'image',
	);
	const preferredAsset = image?.assets?.find(
		({ file, typeData }) => file && typeData?.width === 500,
	);
	const fallbackAsset = image?.assets?.find(({ file }) => file);
	return {
		alt: image?.imageTypeData?.alt,
		src:
			preferredAsset?.file ?? fallbackAsset?.file ?? article?.fields?.thumbnail,
	};
};
