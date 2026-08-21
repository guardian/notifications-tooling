import { Option, Select } from '@guardian/stand/Select';
import { Controller, useFormContext } from 'react-hook-form';
import type { AppAlertFormValues } from '../notification-forms';
import { alertTypeNameMap } from '../option-values';
import { SelectableEditions } from './SelectableEditions';

const toOptionKey = (value: string, name = 'alertType') => `${name}//${value}`;

export const AlertEditionsSection = () => {
	const { control } = useFormContext<AppAlertFormValues>();
	return (
		<>
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
							if (
								selectedAlertType === 'breaking-news' ||
								selectedAlertType === 'sport' ||
								selectedAlertType === 'editors-picks' ||
								selectedAlertType === 'one-not-to-miss'
							) {
								field.onChange(selectedAlertType);
							}
						}}
						selectionMode="single"
						value={toOptionKey(field.value)}
					>
						<Option id={toOptionKey('breaking-news')}>
							{alertTypeNameMap['breaking-news']}
						</Option>
						<Option id={toOptionKey('sport')}>
							{alertTypeNameMap['sport']}
						</Option>
						<Option id={toOptionKey('editors-picks')}>
							{alertTypeNameMap['editors-picks']}
						</Option>
						<Option id={toOptionKey('one-not-to-miss')}>
							{alertTypeNameMap['one-not-to-miss']}
						</Option>
					</Select>
				)}
			/>
			<Controller
				control={control}
				name="editions"
				render={({ field, fieldState }) => (
					<SelectableEditions
						title="Editions"
						description="Choose the editions the app alert will be sent to"
						selected={field.value}
						onChange={field.onChange}
						error={fieldState.error?.message}
					/>
				)}
			/>
		</>
	);
};
