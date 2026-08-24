import { Controller, useFormContext } from 'react-hook-form';
import type { NewsletterFormValues } from '../notification-forms';
import { useAudienceEditions } from '../use-audience-editions';
import { AudienceSegments } from './AudienceSegments';

export const AudienceSegmentsFormField = () => {
	const { control } = useFormContext<NewsletterFormValues>();
	const segments = useAudienceEditions('email');

	return (
		<Controller
			control={control}
			name="audienceSegments"
			render={({ field, fieldState }) => (
				<AudienceSegments
					selected={field.value}
					error={fieldState.error?.message}
					onChange={field.onChange}
					segments={segments}
				/>
			)}
		/>
	);
};
