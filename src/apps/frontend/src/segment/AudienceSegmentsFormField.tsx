import { Controller, useFormContext } from 'react-hook-form';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { SegmentPicker } from './SegmentPicker';
import { useNewsletterEmailSegmentOptions } from './useAudienceEditions';

export const AudienceSegmentsFormField = () => {
	const { control } = useFormContext<NewsletterEmailFormValues>();
	const options = useNewsletterEmailSegmentOptions();

	return (
		<Controller
			control={control}
			name="audienceSegments"
			render={({ field, fieldState }) => (
				<SegmentPicker
					title="Audience"
					description="Choose the audience the email notification will be sent to"
					options={options}
					selected={field.value}
					error={fieldState.error?.message}
					onChange={field.onChange}
				/>
			)}
		/>
	);
};
