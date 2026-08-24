import { Controller, useFormContext } from 'react-hook-form';
import { FALLBACK_EDITIONS } from '../api/useChannelAudiences';
import type { NewsletterFormValues } from '../notification-forms';
import { AudienceSegments } from './AudienceSegments';

export const AudienceSegmentsFormField = () => {
	const { control } = useFormContext<NewsletterFormValues>();

	return (
		<Controller
			control={control}
			name="audienceSegments"
			render={({ field, fieldState }) => (
				<AudienceSegments
					selected={field.value}
					error={fieldState.error?.message}
					onChange={field.onChange}
					segments={FALLBACK_EDITIONS}
				/>
			)}
		/>
	);
};
