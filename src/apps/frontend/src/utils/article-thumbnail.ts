import type { ResolvedArticle } from '@models';

interface ArticleThumbnail {
	alt?: string;
	src?: string;
}

const getBlockToFindImageElementIn = (article?: ResolvedArticle) => {
	if (article?.type === 'liveblog') {
		return article.blocks?.main;
	}
	return undefined;
};

export const getArticleThumbnail = (
	article?: ResolvedArticle,
): ArticleThumbnail => {
	const image = getBlockToFindImageElementIn(article)?.elements?.find(
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
