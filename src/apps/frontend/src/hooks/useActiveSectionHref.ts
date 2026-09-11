import { useLocation } from 'react-router-dom';

export const DEFAULT_ACTIVE_SECTION_HREF = '#article-section';

export const useActiveSectionHref = () =>
	useLocation().hash || DEFAULT_ACTIVE_SECTION_HREF;
