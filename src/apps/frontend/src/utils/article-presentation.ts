import type { CapiBlock, ResolvedArticle } from '@models';
import { getSelectedLiveblogBlock } from './article-liveblog';
import { getArticleThumbnail } from './article-thumbnail';

interface ArticlePresentationOptions {
	article: ResolvedArticle;
	requestedUrl?: string;
	requestedBlock?: CapiBlock;
}

export const getArticlePresentation = ({
	article,
	requestedUrl,
	requestedBlock,
}: ArticlePresentationOptions) => {
	const isLiveblog = article.type === 'liveblog';
	const liveblogBlock = getSelectedLiveblogBlock(article, requestedBlock);

	return {
		headline: article.fields?.headline ?? article.webTitle,
		isLiveblog,
		linkUrl: requestedUrl ?? article.webUrl,
		liveblogBlock,
		publishedDate: isLiveblog
			? article.fields?.lastModified
			: article.webPublicationDate,
		thumbnail: getArticleThumbnail(article),
	};
};
