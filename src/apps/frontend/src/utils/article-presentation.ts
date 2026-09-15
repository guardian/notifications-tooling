import type { CapiBlock, ResolvedArticle } from '@models';
import { getSelectedLiveblogBlock } from './article-liveblog';
import { getArticleThumbnail } from './article-thumbnail';

interface ArticlePresentationOptions {
	content: ResolvedArticle;
	requestedUrl?: string;
	requestedBlock?: CapiBlock;
}

export const getArticlePresentation = ({
	content,
	requestedUrl,
	requestedBlock,
}: ArticlePresentationOptions) => {
	const isLiveblog = content.type === 'liveblog';
	const liveblogBlock = getSelectedLiveblogBlock(content, requestedBlock);

	return {
		headline: content.fields?.headline ?? content.webTitle,
		isLiveblog,
		linkUrl: requestedUrl ?? content.webUrl,
		liveblogBlock,
		publishedDate: isLiveblog
			? content.fields?.lastModified
			: content.webPublicationDate,
		thumbnail: getArticleThumbnail(content, liveblogBlock),
	};
};
