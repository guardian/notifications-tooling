import type { ResolvedArticle } from '@models';

interface ArticleThumbnail {
	alt?: string;
	src?: string;
}

export const getArticleThumbnail = (
	content?: ResolvedArticle,
): ArticleThumbnail => {
	const mainBlock =
		content?.type === 'liveblog' ? content.blocks?.main : undefined;
	const image = mainBlock?.elements?.find(({ type }) => type === 'image');
	const preferredAsset = image?.assets?.find(
		({ file, typeData }) => file && typeData?.width === 500,
	);
	const fallbackAsset = image?.assets?.find(({ file }) => file);

	return {
		alt: image?.imageTypeData?.alt,
		src:
			preferredAsset?.file ?? fallbackAsset?.file ?? content?.fields?.thumbnail,
	};
};
