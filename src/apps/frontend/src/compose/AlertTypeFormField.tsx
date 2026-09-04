import { Option, Select } from '@guardian/stand/Select';
import { Controller, useFormContext } from 'react-hook-form';
import { useAppPushTopicTypes } from '../segment/useChannelAudiences';
import type { AppAlertFormValues } from '../utils/notification-forms';

const toOptionKey = (value: string) => `alertType//${value}`;

export const AlertTypeFormField = () => {
	const { control } = useFormContext<AppAlertFormValues>();
	const topicTypes = useAppPushTopicTypes();

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
						if (topicTypes.some(({ id }) => id === selectedAlertType)) {
							field.onChange(selectedAlertType);
						}
					}}
					selectionMode="single"
					value={toOptionKey(field.value)}
				>
					{topicTypes.map(({ id, label }) => (
						<Option key={id} id={toOptionKey(id)}>
							{label}
						</Option>
					))}
				</Select>
			)}
		/>
	);
};
