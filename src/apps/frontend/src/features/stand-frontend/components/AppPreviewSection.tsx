import { css } from '@emotion/react';
import { semanticColors, semanticSizing } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { useContext } from 'react';
import { useWatch } from 'react-hook-form';
import type { TopicTypeOption } from '../api/schemas';
import { editionIds } from '../edition-values';
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
	topicTypes: TopicTypeOption[];
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
	const includeThumbnail = useWatch<AppAlertFormValues, 'includeThumbnail'>({
		name: 'includeThumbnail',
		defaultValue: defaultAppAlertFormValues.includeThumbnail,
	});
	const alertTypeLabel =
		topicTypes.find(({ id }) => id === alertType)?.label ?? alertType;
	const selectedTopics = editions.map((edition) => ({
		type: alertType,
		name: editionIds[edition],
	}));
	const thumbnailUrl = includeThumbnail
		? notification.content?.fields?.thumbnail
		: undefined;

	return (
		<PreviewSection
			title="Preview"
			description="The preview for the app alert will be shown below."
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
