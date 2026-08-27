import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { ChannelConstraintsResponse } from '../api/schemas';
import { NEWSLETTER_LIMIT_FALLBACKS } from '../api/useChannelConstraints';
import type { NewsletterFormValues } from '../notification-forms';
import { kickerNameMap } from '../option-values';
import { NotificationTextInputWithPrefix } from './NotificationTextInput';

interface SubjectFormFieldProps {
	constraints?: ChannelConstraintsResponse;
}

export const SubjectFormField = ({ constraints }: SubjectFormFieldProps) => {
	const { control } = useFormContext<NewsletterFormValues>();
	const kicker = useWatch<NewsletterFormValues, 'kicker'>({
		control,
		name: 'kicker',
	});
	const subjectLimits =
		constraints?.channels.newsletter.compose.subject ??
		NEWSLETTER_LIMIT_FALLBACKS.title;
	const kickerLabel = ['breaking-news', 'exclusive'].includes(kicker)
		? kickerNameMap[kicker]
		: undefined;
	const placeholderText = kickerLabel
		? `${kickerLabel}: Enter a subject line here...`
		: 'Enter a subject line here...';

	return (
		<Controller
			control={control}
			name="subject"
			render={({ field, fieldState }) => (
				<NotificationTextInputWithPrefix
					name={field.name}
					label="Subject"
					description="Choose the subject line (kicker included in character count)"
					placeholder={placeholderText}
					value={field.value}
					update={field.onChange}
					softLimit={subjectLimits.recommended}
					hardLimit={subjectLimits.editorialLimit}
					error={fieldState.error?.message}
					prefix={kickerLabel ? `${kickerLabel}: ` : undefined}
				/>
			)}
		/>
	);
};
