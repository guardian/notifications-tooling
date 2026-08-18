import { css } from '@emotion/react';
import { semanticColors, semanticSizing } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import type { TopicTypeOption } from '../api/schemas';
import type { AppPushTopicSelection } from './Editions';
import { Editions } from './Editions';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

const TEMPORARY_SELECTED_TOPICS: AppPushTopicSelection[] = [
	{ type: 'breaking-news', name: 'uk' },
	{ type: 'breaking-news', name: 'international' },
];

interface AppPreviewSectionProps {
	topicTypes: TopicTypeOption[];
	selectedTopics?: AppPushTopicSelection[];
}

export const AppPreviewSection = ({
	topicTypes,
	selectedTopics = TEMPORARY_SELECTED_TOPICS,
}: AppPreviewSectionProps) => {
	return (
		<PreviewSection
			title="Preview"
			description="The preview for the app alert will be shown below."
			isVisible={Boolean(true)}
		>
			<SendInfoPreviewPill channel="push" deliveryTiming="immediate" />
			<Editions topicTypes={topicTypes} selected={selectedTopics} />
			<AlertBanner
				level="information"
				showIcon
				cssOverrides={css({
					border: `${semanticSizing.border.default} solid ${semanticColors.border.information}`,
					height: 'auto',
					paddingBlock: '12px',
				})}
			>
				<span css={{ fontSize: '14px' }}>
					App alert formats might differ across platforms and devices
				</span>
			</AlertBanner>
			{/* App Preview iPhone and Android */}
		</PreviewSection>
	);
};
