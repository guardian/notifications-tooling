import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { ChannelConstraintsResponse } from '../api/schemas';
import { NEWSLETTER_LIMIT_FALLBACKS } from '../api/useChannelConstraints';
import { composeNewsletterSubject } from '../newsletter-subject';
import type { NewsletterFormValues } from '../notification-forms';
import { NotificationTextInput } from './NotificationTextInput';

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

	return (
		<Controller
			control={control}
			name="subject"
			render={({ field, fieldState }) => (
				<NotificationTextInput
					name={field.name}
					label="Subject"
					description="Choose the subject line (kicker included in character count)"
					placeholder="Enter a subject line here..."
					value={field.value}
					update={field.onChange}
					softLimit={subjectLimits.recommended}
					hardLimit={subjectLimits.editorialLimit}
					characterCount={composeNewsletterSubject(field.value, kicker).length}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};
