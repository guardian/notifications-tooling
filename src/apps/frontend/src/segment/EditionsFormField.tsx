import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
	type AppAlertFormValues,
	defaultAppAlertFormValues,
} from '../utils/notification-forms';
import { SegmentPicker } from './SegmentPicker';
import { useTopicEditionOptions } from './useAudienceEditions';

export const EditionsFormField = () => {
	const { control } = useFormContext<AppAlertFormValues>();
	const alertType = useWatch<AppAlertFormValues, 'alertType'>({
		control,
		name: 'alertType',
		defaultValue: defaultAppAlertFormValues.alertType,
	});
	const options = useTopicEditionOptions(alertType);

	return (
		<Controller
			control={control}
			name="editions"
			render={({ field, fieldState }) => (
				<SegmentPicker
					title="Editions"
					description="Choose the editions the app alert will be sent to"
					options={options}
					selected={field.value}
					onChange={field.onChange}
					error={fieldState.error?.message}
				/>
			)}
		/>
	);
};
