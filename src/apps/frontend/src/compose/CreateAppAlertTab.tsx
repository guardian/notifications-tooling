import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { AppAlertPreviewSection } from '../preview/AppAlertPreviewSection';
import { AppAlertPreviewToggle } from '../preview/PreviewToggle';
import { articleUrlSearchParam, toGuardianArticleUrl } from '../routes';
import { useAppAlertTopicTypes } from '../segment/useChannelAudiences';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateAppAlertTab = () => {
	const { reset } = useFormContext<AppAlertFormValues>();
	const [searchParams] = useSearchParams();
	const [initialArticleUrl] = useState(() =>
		toGuardianArticleUrl(searchParams.get(articleUrlSearchParam)),
	);
	const topicTypes = useAppAlertTopicTypes();

	useEffect(() => reset(), [reset]);

	return (
		<NotificationTabLayout
			channel="app-push"
			previewToggle={<AppAlertPreviewToggle topicTypes={topicTypes} />}
			form={<CreateAppAlertForm initialArticleUrl={initialArticleUrl} />}
			previewSection={<AppAlertPreviewSection topicTypes={topicTypes} />}
		/>
	);
};
