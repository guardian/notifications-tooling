import { css } from '@emotion/react';
import { semanticColors, semanticSizing } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { useContext } from 'react';
import type { TopicTypeOption } from '../api/schemas';
import { NotificationFormContext } from '../NotificationContext';
import { AndroidAlertPreview } from './AndroidAlertPreview';
import type { AppPushTopicSelection } from './Editions';
import { Editions } from './Editions';
import { IPhoneAlertPreview } from './IPhoneAlertPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

interface AppPreviewSectionProps {
	topicTypes: TopicTypeOption[];
	selectedTopics: AppPushTopicSelection[];
}

export const AppPreviewSection = ({
	topicTypes,
	selectedTopics,
}: AppPreviewSectionProps) => {
	const { notification } = useContext(NotificationFormContext);
	const parameters =
		notification.parameters?.type === 'push'
			? notification.parameters
			: undefined;
	const alertType = parameters?.alertType ?? 'breaking-news';
	const alertTypeLabel =
		topicTypes.find(({ id }) => id === alertType)?.label ?? alertType;
	const headline = parameters?.headline;
	const thumbnailUrl = notification.content?.fields?.thumbnail;

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
			<IPhoneAlertPreview
				alertType={alertTypeLabel}
				headline={headline}
				thumbnailUrl={thumbnailUrl}
			/>
			<AndroidAlertPreview
				alertType={alertTypeLabel}
				headline={headline}
				thumbnailUrl={thumbnailUrl}
			/>
		</PreviewSection>
	);
};
