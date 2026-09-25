import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AppAlertPreviewSection } from '../preview/AppAlertPreviewSection';
import { AppAlertPreviewToggle } from '../preview/PreviewToggle';
import {
	articleUrlSearchParam,
	parseCopiedNotificationState,
	toGuardianArticleUrl,
} from '../routes';
import { useAppAlertTopicTypes } from '../segment/useChannelAudiences';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateAppAlertTab = () => {
	const { reset, setValue } = useFormContext<AppAlertFormValues>();
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const [initialArticleUrl] = useState(() =>
		toGuardianArticleUrl(searchParams.get(articleUrlSearchParam)),
	);
	const [copyNavigationState] = useState(() =>
		initialArticleUrl === undefined
			? undefined
			: parseCopiedNotificationState(location.state),
	);
	const topicTypes = useAppAlertTopicTypes();

	useEffect(() => {
		reset();
		if (copyNavigationState) {
			setValue('headline', copyNavigationState.contentTitle);
		}
	}, [copyNavigationState, reset, setValue]);

	return (
		<NotificationTabLayout
			channel="app-push"
			previewToggle={<AppAlertPreviewToggle topicTypes={topicTypes} />}
			form={
				<CreateAppAlertForm
					initialArticleUrl={initialArticleUrl}
					initialHeadline={copyNavigationState?.contentTitle}
					showReviewWarning={copyNavigationState !== undefined}
				/>
			}
			previewSection={<AppAlertPreviewSection topicTypes={topicTypes} />}
		/>
	);
};
