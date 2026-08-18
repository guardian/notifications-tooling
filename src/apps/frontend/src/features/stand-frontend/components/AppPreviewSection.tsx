import { css } from '@emotion/react';
import { semanticColors, semanticSizing } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import type { AppPushTopicSelection, TopicTypeOption } from './Editions';
import { Editions } from './Editions';
import { IPhoneAlertPreview } from './IPhoneAlertPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

// TODO: Replace these defaults with GET /v1/channels/audiences data and
// app-alert form selections when that integration is available.
const TEMPORARY_TOPIC_TYPES: TopicTypeOption[] = [
	{
		id: 'breaking-news',
		label: 'Breaking news',
		editions: [
			{ id: 'uk', label: 'UK' },
			{ id: 'us', label: 'US' },
			{ id: 'au', label: 'AU' },
			{ id: 'international', label: 'International' },
			{ id: 'europe', label: 'Europe' },
		],
	},
];

const TEMPORARY_SELECTED_TOPICS: AppPushTopicSelection[] = [
	{ type: 'breaking-news', name: 'uk' },
	{ type: 'breaking-news', name: 'international' },
];

const TEMPORARY_THUMBNAIL_URL =
	'https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg';

interface AppPreviewSectionProps {
	topicTypes?: TopicTypeOption[];
	selectedTopics?: AppPushTopicSelection[];
}

export const AppPreviewSection = ({
	topicTypes = TEMPORARY_TOPIC_TYPES,
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
				App alert formats might differ across platforms and devices
			</AlertBanner>
			<IPhoneAlertPreview thumbnailUrl={TEMPORARY_THUMBNAIL_URL} />
		</PreviewSection>
	);
};
