import { css } from '@emotion/react';
import { semanticColors, semanticSizing } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { type AppAlertTopicOption, toApiEditionId } from '@models';
import { useContext } from 'react';
import { useWatch } from 'react-hook-form';
import {
	type AppAlertFormValues,
	defaultAppAlertFormValues,
} from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { AndroidAlertPreview } from './AndroidAlertPreview';
import { Editions } from './Editions';
import { IPhoneAlertPreview } from './IPhoneAlertPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

interface AppPreviewSectionProps {
	topicTypes: AppAlertTopicOption[];
}

export const AppPreviewSection = ({ topicTypes }: AppPreviewSectionProps) => {
	const { notification } = useContext(NotificationFormContext);
	const alertType = useWatch<AppAlertFormValues, 'alertType'>({
		name: 'alertType',
		defaultValue: defaultAppAlertFormValues.alertType,
	});
	const editions = useWatch<AppAlertFormValues, 'editions'>({
		name: 'editions',
		defaultValue: defaultAppAlertFormValues.editions,
	});
	const headline = useWatch<AppAlertFormValues, 'headline'>({
		name: 'headline',
		defaultValue: defaultAppAlertFormValues.headline,
	});
	const alertTypeLabel =
		topicTypes.find(({ id }) => id === alertType)?.label ?? alertType;
	const selectedTopics = editions.map((edition) => ({
		type: alertType,
		name: toApiEditionId(edition),
	}));
	const thumbnailUrl = notification.content?.fields?.thumbnail;

	return (
		<PreviewSection
			title="Preview"
			description="The preview for the app alert will be shown below."
			isVisible={Boolean(notification.fetchedArticleId)}
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
