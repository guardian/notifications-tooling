import type { ResolvedArticle } from '@models';
import { getSelectedLiveblogBlock } from './article-liveblog';

interface ArticleThumbnail {
	alt?: string;
	src?: string;
}

export const getArticleThumbnail = (
	content?: ResolvedArticle,
): ArticleThumbnail => {
	const image = getSelectedLiveblogBlock(content)?.elements?.find(
		({ type }) => type === 'image',
	);
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
