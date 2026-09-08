import type { CapiBlock, ResolvedArticle } from '@models';

export const getSelectedLiveblogBlock = (
	content?: ResolvedArticle,
	requestedBlock?: CapiBlock,
): CapiBlock | undefined =>
	content?.type === 'liveblog'
		? (requestedBlock ?? content.blocks?.main)
		: undefined;
