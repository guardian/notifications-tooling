import type { CapiBlock, ResolvedArticle } from '@models';

export const getSelectedLiveblogBlock = (
	article?: ResolvedArticle,
	requestedBlock?: CapiBlock,
): CapiBlock | undefined =>
	article?.type === 'liveblog'
		? (requestedBlock ?? article.blocks?.main)
		: undefined;
