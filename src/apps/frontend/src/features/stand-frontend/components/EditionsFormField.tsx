import { Controller, useFormContext } from 'react-hook-form';
import type { AppAlertFormValues } from '../notification-forms';
import { DEFAULT_EDITIONS } from './EditionOptions';
import { SegmentPicker } from './SegmentPicker';

export const EditionsFormField = () => {
	const { control } = useFormContext<AppAlertFormValues>();

	return (
		<Controller
			control={control}
			name="editions"
			render={({ field, fieldState }) => (
				<SegmentPicker
					title="Editions"
					description="Choose the editions the app alert will be sent to"
					options={DEFAULT_EDITIONS}
					selected={field.value}
					onChange={field.onChange}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};
