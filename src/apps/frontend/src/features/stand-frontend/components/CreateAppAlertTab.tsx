import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FALLBACK_TOPIC_TYPES } from '../audience-fallbacks';
import { useChannelAudiences } from '../api/useChannelAudiences';
import type { AppAlertFormValues } from '../notification-forms';
import { AppPreviewSection } from './AppPreviewSection';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';
import { AppPreviewToggle } from './PreviewToggle';

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
