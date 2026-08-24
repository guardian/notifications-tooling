import { Controller, useFormContext } from 'react-hook-form';
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
				/>
			)}
		/>
	);
};
