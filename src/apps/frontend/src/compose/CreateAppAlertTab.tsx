import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AppPreviewSection } from '../preview/AppPreviewSection';
import { AppPreviewToggle } from '../preview/PreviewToggle';
import { FALLBACK_TOPIC_TYPES } from '../segment/audience-fallbacks';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';
import type { AppAlertFormValues } from './notification-forms';

export const CreateAppAlertTab = () => {
	const { reset } = useFormContext<AppAlertFormValues>();
	const { data: audiences } = useChannelAudiences();

	useEffect(() => reset(), [reset]);

	const topicTypes =
		audiences?.channels['app-push'].topicTypes ?? FALLBACK_TOPIC_TYPES;

	return (
		<NotificationTabLayout
			channel="push"
			previewToggle={<AppPreviewToggle topicTypes={topicTypes} />}
			renderForm={(activeSectionHref) => (
				<CreateAppAlertForm activeSectionHref={activeSectionHref} />
			)}
			previewSection={<AppPreviewSection topicTypes={topicTypes} />}
		/>
	);
};
