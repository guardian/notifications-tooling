import { Controller, useFormContext } from 'react-hook-form';
import type { NewsletterFormValues } from '../compose/notification-forms';
import { useNewsletterSegmentOptions } from './use-audience-editions';
import { SegmentPicker } from './SegmentPicker';

export const AudienceSegmentsFormField = () => {
	const { control } = useFormContext<NewsletterFormValues>();
	const options = useNewsletterSegmentOptions();

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
