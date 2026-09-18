import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { AppAlertPreviewSection } from '../preview/AppAlertPreviewSection';
import { AppAlertPreviewToggle } from '../preview/PreviewToggle';
import { useAppAlertTopicTypes } from '../segment/useChannelAudiences';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateAppAlertTab = ({
	initialArticleUrl,
}: {
	initialArticleUrl?: string;
}) => {
	const { reset } = useFormContext<AppAlertFormValues>();
	const [searchParams] = useSearchParams();
	const topicTypes = useAppAlertTopicTypes();
	const articleUrl =
		initialArticleUrl ?? searchParams.get('article') ?? undefined;

	useEffect(() => reset(), [reset]);

	return (
		<NotificationTabLayout
			channel="app-push"
			previewToggle={<AppAlertPreviewToggle topicTypes={topicTypes} />}
			form={<CreateAppAlertForm initialArticleUrl={articleUrl} />}
			previewSection={<AppAlertPreviewSection topicTypes={topicTypes} />}
		/>
	);
};
