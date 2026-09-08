import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AppPreviewSection } from '../preview/AppPreviewSection';
import { AppPreviewToggle } from '../preview/PreviewToggle';
import { useAppPushTopicTypes } from '../segment/useChannelAudiences';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateAppAlertTab = () => {
	const { reset } = useFormContext<AppAlertFormValues>();
	const topicTypes = useAppPushTopicTypes();

	useEffect(() => reset(), [reset]);

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
