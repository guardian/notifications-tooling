import { Controller, useFormContext } from 'react-hook-form';
import type { AppAlertFormValues } from '../compose/notification-forms';
import { EDITION_OPTIONS } from './EditionOptions';
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
					options={EDITION_OPTIONS}
					selected={field.value}
					onChange={field.onChange}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};
