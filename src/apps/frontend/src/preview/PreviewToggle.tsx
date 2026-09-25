import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import type { AppAlertTopicOption } from '@models';
import type { ReactNode } from 'react';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { AppAlertPreviewSection } from './AppAlertPreviewSection';
import { NewsletterEmailPreviewSection } from './NewsletterEmailPreviewSection';

interface PreviewToggleProps {
	children: ReactNode;
}

const PreviewToggle = ({ children }: PreviewToggleProps) => {
	return (
		<CollapsibleSection
			label="Preview"
			containerStyles={css({
				display: 'flex',
				flexDirection: 'column',
				['@media (min-width: 1310px)']: {
					display: 'none',
				},
				borderBottom: `2px solid ${semanticColors.border.weak}`,
			})}
			toggleStyles={css({
				alignItems: 'center',
				background: semanticColors.bg.raisedLevel1,
				border: 0,
				color: semanticColors.text.strong,
				cursor: 'pointer',
				display: 'flex',
				justifyContent: 'space-between',
				padding: semanticSpacing.stackSm,
				width: '100%',
			})}
		>
			{children}
		</CollapsibleSection>
	);
};

export const AppAlertPreviewToggle = ({
	topicTypes,
}: {
	topicTypes: AppAlertTopicOption[];
}) => (
	<PreviewToggle>
		<AppAlertPreviewSection topicTypes={topicTypes} />
	</PreviewToggle>
);

export const NewsletterEmailPreviewToggle = () => (
	<PreviewToggle>
		<NewsletterEmailPreviewSection />
	</PreviewToggle>
);
