import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { NEWSLETTER_EMAIL_LIMIT_FALLBACKS } from '../hooks/useChannelConstraints';
import type { ChannelConstraintsResponse } from '../schemas';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { kickerNameMap } from '../utils/option-values';
import { NotificationTextInputWithPrefix } from './NotificationTextInput';

interface SubjectFormFieldProps {
	constraints?: ChannelConstraintsResponse;
}

export const SubjectFormField = ({ constraints }: SubjectFormFieldProps) => {
	const { control } = useFormContext<NewsletterEmailFormValues>();
	const kicker = useWatch<NewsletterEmailFormValues, 'kicker'>({
		control,
		name: 'kicker',
	});
	const subjectLineLimits =
		constraints?.channels.newsletter.compose.subject ??
		NEWSLETTER_EMAIL_LIMIT_FALLBACKS.title;
	const kickerLabel =
		kicker === 'breaking-news' || kicker === 'exclusive'
			? kickerNameMap[kicker]
			: undefined;
	const placeholderText = kickerLabel
		? `${kickerLabel}: Enter a subject line here...`
		: 'Enter a subject line here...';

	return (
		<Controller
			control={control}
			name="subjectText"
			render={({ field, fieldState }) => (
				<NotificationTextInputWithPrefix
					name={field.name}
					label="Subject"
					description="Choose the subject line (kicker included in character count)"
					placeholder={placeholderText}
					value={field.value}
					onChange={field.onChange}
					recommendedLimit={subjectLineLimits.recommended}
					error={fieldState.error?.message}
					prefix={kickerLabel ? `${kickerLabel}: ` : undefined}
				/>
			)}
		/>
	);
};
