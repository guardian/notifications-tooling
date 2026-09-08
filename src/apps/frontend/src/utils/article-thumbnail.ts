import type { CapiBlock, ResolvedArticle } from '@models';
import { getSelectedLiveblogBlock } from './article-liveblog';

interface ArticleThumbnail {
	alt?: string;
	src?: string;
}

export const getArticleThumbnail = (
	content?: ResolvedArticle,
	requestedBlock?: CapiBlock,
): ArticleThumbnail => {
	const image = getSelectedLiveblogBlock(
		content,
		requestedBlock,
	)?.elements?.find(({ type }) => type === 'image');
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
