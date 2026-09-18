import { Option, Select } from '@guardian/stand/Select';
import { Controller, useFormContext } from 'react-hook-form';
import { kickerSchema } from '../schemas';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { kickerNameMap } from '../utils/option-values';

const toOptionKey = (value: string) => `kicker//${value}`;

export const KickerFormField = () => {
	const { control } = useFormContext<NewsletterEmailFormValues>();

	return (
		<Controller
			control={control}
			name="kicker"
			render={({ field, fieldState }) => (
				<Select
					name={field.name}
					label="Kicker"
					description="Choose the kicker for the email newsletter"
					placeholder="Choose a kicker"
					onChange={(key) => {
						const result = kickerSchema.safeParse(
							typeof key === 'string' ? key.split('//').at(1) : undefined,
						);
						if (result.success) {
							field.onChange(result.data);
						}
					}}
					selectionMode="single"
					value={field.value ? toOptionKey(field.value) : null}
					isInvalid={fieldState.invalid}
					error={fieldState.error?.message}
				>
					<Option id={toOptionKey('breaking-news')}>
						{kickerNameMap['breaking-news']}
					</Option>
					<Option id={toOptionKey('exclusive')}>
						{kickerNameMap['exclusive']}
					</Option>
					<Option id={toOptionKey('none')}>{kickerNameMap.none}</Option>
				</Select>
			)}
		/>
	);
};
