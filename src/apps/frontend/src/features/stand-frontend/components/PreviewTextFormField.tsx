import { Controller, useFormContext } from 'react-hook-form';
import type { ChannelConstraintsResponse } from '../api/schemas';
import { NEWSLETTER_LIMIT_FALLBACKS } from '../api/useChannelConstraints';
import type { NewsletterFormValues } from '../notification-forms';
import { NotificationTextInput } from './NotificationTextInput';

interface PreviewTextFormFieldProps {
	constraints?: ChannelConstraintsResponse;
}

export const PreviewTextFormField = ({
	constraints,
}: PreviewTextFormFieldProps) => {
	const { control } = useFormContext<NewsletterFormValues>();
	const previewLimits =
		constraints?.channels.newsletter.content.body ??
		NEWSLETTER_LIMIT_FALLBACKS.body;

	return (
		<Controller
			control={control}
			name="preview"
			render={({ field, fieldState }) => (
				<NotificationTextInput
					name={field.name}
					label="Preview text"
					description="Choose the preview text for the email newsletter"
					placeholder="Enter preview text here..."
					value={field.value}
					update={field.onChange}
					softLimit={previewLimits.recommended}
					hardLimit={previewLimits.validationCap}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};
