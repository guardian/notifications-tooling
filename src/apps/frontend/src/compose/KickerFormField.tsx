import { Option, Select } from '@guardian/stand/Select';
import { Controller, useFormContext } from 'react-hook-form';
import { kickerSchema } from '../schemas';
import type { NewsletterFormValues } from '../utils/notification-forms';
import { kickerNameMap } from '../utils/option-values';

const toOptionKey = (value: string) => `kicker//${value}`;

export const KickerFormField = () => {
	const { control } = useFormContext<NewsletterFormValues>();

	return (
		<Controller
			control={control}
			name="kicker"
			render={({ field }) => (
				<Select
					name={field.name}
					label="Kicker"
					description="Choose the kicker for the email newsletter"
					onChange={(key) => {
						const result = kickerSchema.safeParse(
							typeof key === 'string' ? key.split('//').at(1) : undefined,
						);
						if (result.success) {
							field.onChange(result.data);
						}
					}}
					selectionMode="single"
					value={toOptionKey(field.value)}
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
