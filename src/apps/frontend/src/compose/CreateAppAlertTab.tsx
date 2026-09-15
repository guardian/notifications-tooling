import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { AppAlertPreviewSection } from '../preview/AppAlertPreviewSection';
import { AppAlertPreviewToggle } from '../preview/PreviewToggle';
import { useAppAlertTopicTypes } from '../segment/useChannelAudiences';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateAppAlertTab = () => {
	const { reset } = useFormContext<AppAlertFormValues>();
	const topicTypes = useAppAlertTopicTypes();

	useEffect(() => reset(), [reset]);

	return (
		<NotificationTabLayout
			channel="app-push"
			previewToggle={<AppAlertPreviewToggle topicTypes={topicTypes} />}
			form={<CreateAppAlertForm />}
			previewSection={<AppAlertPreviewSection topicTypes={topicTypes} />}
		/>
	);
};
