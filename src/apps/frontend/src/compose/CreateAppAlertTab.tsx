import { useLayoutEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { AppAlertPreviewSection } from '../preview/AppAlertPreviewSection';
import { AppAlertPreviewToggle } from '../preview/PreviewToggle';
import { useAppAlertTopicTypes } from '../segment/useChannelAudiences';
import {
	type AppAlertFormValues,
	defaultAppAlertFormValues,
} from '../utils/notification-forms';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';
import { useNotificationPrefill } from './useNotificationPrefill';

export const CreateAppAlertTab = () => {
	const { reset } = useFormContext<AppAlertFormValues>();
	const routePrefill = useNotificationPrefill('app-push');
	const [prefill] = useState(routePrefill);
	const topicTypes = useAppAlertTopicTypes();

	useLayoutEffect(
		() =>
			reset(
				{ ...defaultAppAlertFormValues, ...prefill?.fields },
				{ keepDefaultValues: true },
			),
		[prefill, reset],
	);

	return (
		<NotificationTabLayout
			channel="app-push"
			previewToggle={<AppAlertPreviewToggle topicTypes={topicTypes} />}
			form={
				<CreateAppAlertForm
					initialArticleUrl={prefill?.articleUrl}
					fieldOverrides={prefill?.fields}
				/>
			}
			previewSection={<AppAlertPreviewSection topicTypes={topicTypes} />}
		/>
	);
};
