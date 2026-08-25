import { Option, Select } from '@guardian/stand/Select';
import { Controller, useFormContext } from 'react-hook-form';
import {
	appAlertFormSchema,
	type AppAlertFormValues,
} from '../notification-forms';
import { alertTypeNameMap } from '../option-values';

const toOptionKey = (value: string) => `alertType//${value}`;
const alertTypeSchema = appAlertFormSchema.shape.alertType;

export const AlertTypeFormField = () => {
	const { control } = useFormContext<AppAlertFormValues>();

	return (
		<Controller
			control={control}
			name="alertType"
			render={({ field }) => (
				<Select
					name={field.name}
					label="Alert type"
					description="Choose the type of app alert"
					onChange={(key) => {
						const selectedAlertType =
							typeof key === 'string' ? key.split('//').at(1) : undefined;
						const result = alertTypeSchema.safeParse(selectedAlertType);
						if (result.success) {
							field.onChange(result.data);
						}
					}}
					selectionMode="single"
					value={toOptionKey(field.value)}
				>
					{alertTypeSchema.options.map((alertType) => (
						<Option key={alertType} id={toOptionKey(alertType)}>
							{alertTypeNameMap[alertType]}
						</Option>
					))}
				</Select>
			)}
		/>
	);
};
