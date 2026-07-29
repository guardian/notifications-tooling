import { semanticColors, semanticRadius } from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';

export const ArticlePreviewBox = () => {
	return (
		<div
			css={{
				flow: 'horizontal',
				height: '92px',
				width: '341px',
				borderRadius: semanticRadius.cornerSm,
				justifyContent: 'space-between',
				padding: baseSpacing['8Px'],
				backgroundColor: semanticColors.bg.raisedLevel1,
			}}
		></div>
	);
};
