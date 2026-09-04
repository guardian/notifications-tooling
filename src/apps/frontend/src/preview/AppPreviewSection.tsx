import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Typography } from '@guardian/stand/Typography';
import { type AppAlertTopicOption, toApiEditionId } from '@models';
import { useContext } from 'react';
import { useWatch } from 'react-hook-form';
import { NotificationFormContext } from '../compose/NotificationContext';
import { Editions } from '../segment/Editions';
import { SendInfoPreviewPill } from '../send/SendInfoPreviewPill';
import { alertBannerCss, customAlertBannerTheme } from '../themes';
import { getArticleThumbnail } from '../utils/article-thumbnail';
import {
	type AppAlertFormValues,
	defaultAppAlertFormValues,
} from '../utils/notification-forms';
import { AndroidAlertPreview } from './AndroidAlertPreview';
import { IPhoneAlertPreview } from './IPhoneAlertPreview';
import { PreviewSection } from './PreviewSection';

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
	const includeThumbnail = useWatch<AppAlertFormValues, 'includeThumbnail'>({
		name: 'includeThumbnail',
		defaultValue: defaultAppAlertFormValues.includeThumbnail,
	});
	const alertTypeLabel =
		topicTypes.find(({ id }) => id === alertType)?.label ?? alertType;
	const selectedTopics = editions.map((edition) => ({
		type: alertType,
		name: toApiEditionId(edition),
	}));
	const thumbnailUrl = includeThumbnail
		? getArticleThumbnail(notification.content).src
		: undefined;

	return (
		<PreviewSection
			title="Preview"
			description="The preview for the app alert will be shown below."
		>
			<SendInfoPreviewPill
				channel="push"
				deliveryTiming="appImmediate"
				includeThumbnail={includeThumbnail}
			/>
			<Editions topicTypes={topicTypes} selected={selectedTopics} />
			<AlertBanner
				level="information"
				showIcon
				cssOverrides={alertBannerCss}
				theme={customAlertBannerTheme}
			>
				<Typography
					variant={'bodyBoldSm'}
					cssOverrides={css({ color: semanticColors.text.blue })}
				>
					App alert formats might differ across platforms and devices
				</Typography>
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
