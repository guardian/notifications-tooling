import { Controller, useFormContext } from 'react-hook-form';
import type { NewsletterFormValues } from '../notification-forms';
import { DEFAULT_SEGMENTS } from './AudienceSegmentOptions';
import { SegmentPicker } from './SegmentPicker';

export const AudienceSegmentsFormField = () => {
	const { control } = useFormContext<NewsletterFormValues>();

	return (
		<Controller
			control={control}
			name="audienceSegments"
			render={({ field, fieldState }) => (
				<SegmentPicker
					title="Audience segments"
					description="Choose the audience the email notification will be sent to"
					options={DEFAULT_SEGMENTS}
					selected={field.value}
					error={fieldState.error?.message}
					onChange={field.onChange}
				/>
			)}
		/>
	);
};
