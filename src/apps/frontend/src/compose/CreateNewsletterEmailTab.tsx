import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import { NewsletterEmailPreviewSection } from '../preview/NewsletterEmailPreviewSection';
import { NewsletterEmailPreviewToggle } from '../preview/PreviewToggle';
import {
	articleUrlSearchParam,
	parseCopiedNotificationState,
	toGuardianArticleUrl,
} from '../routes';
import {
	defaultNewsletterEmailFormValues,
	type NewsletterEmailFormValues,
} from '../utils/notification-forms';
import { CreateNewsletterEmailForm } from './CreateNewsletterEmailForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateNewsletterEmailTab = () => {
	const { reset, setValue, watch } =
		useFormContext<NewsletterEmailFormValues>();
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
	const showPreview = watch('showPreview');

	useEffect(
		() =>
			reset(
				{
					...defaultNewsletterEmailFormValues,
					subjectText:
						copyNavigationState?.contentTitle ??
						defaultNewsletterEmailFormValues.subjectText,
				},
				{ keepDefaultValues: true },
			),
		[copyNavigationState, reset],
	);

	return (
		<NotificationTabLayout
			channel="newsletter"
			previewToggle={<NewsletterEmailPreviewToggle />}
			form={
				<CreateNewsletterEmailForm
					initialArticleUrl={initialArticleUrl}
					initialSubjectText={copyNavigationState?.contentTitle}
					showReviewWarning={copyNavigationState !== undefined}
					showPreview={showPreview}
					onTogglePreview={(isSelected) => {
						setValue('showPreview', isSelected, {
							shouldValidate: true,
						});
					}}
				/>
			}
			previewSection={<NewsletterEmailPreviewSection />}
		/>
	);
};
