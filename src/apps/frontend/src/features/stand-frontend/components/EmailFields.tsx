import { Option, Select } from '@guardian/stand/Select';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { kickerSchema } from '../api/schemas';
import type { useChannelConstraints } from '../api/useChannelConstraints';
import { NEWSLETTER_LIMIT_FALLBACKS } from '../api/useChannelConstraints';
import { composeNewsletterSubject } from '../newsletter-subject';
import type { NewsletterFormValues } from '../notification-forms';
import { kickerNameMap } from '../option-values';
import { NotificationTextInput } from './NotificationTextInput';

const toOptionKey = (value: string, name = 'kicker') => `${name}//${value}`;

interface EmailFieldsProps {
	constraints?: ReturnType<typeof useChannelConstraints>['data'];
}

export const EmailFields = ({ constraints }: EmailFieldsProps) => {
	const { control } = useFormContext<NewsletterFormValues>();
	const kicker = useWatch<NewsletterFormValues, 'kicker'>({
		control,
		name: 'kicker',
	});

	const newsletter = constraints?.channels.newsletter;
	const subjectLimits =
		newsletter?.compose.subject ?? NEWSLETTER_LIMIT_FALLBACKS.title;
	const previewLimits =
		newsletter?.content.body ?? NEWSLETTER_LIMIT_FALLBACKS.body;

	return (
		<>
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

			<Controller
				control={control}
				name="subject"
				render={({ field, fieldState }) => (
					<NotificationTextInput
						label="Subject"
						description="Choose the subject line (kicker included in character count)"
						placeholder="Enter a subject line here..."
						value={field.value}
						update={field.onChange}
						softLimit={subjectLimits.recommended}
						hardLimit={subjectLimits.editorialLimit}
						characterCount={
							composeNewsletterSubject(field.value, kicker).length
						}
						error={fieldState.error?.message}
					/>
				)}
			/>

			<Controller
				control={control}
				name="preview"
				render={({ field, fieldState }) => (
					<NotificationTextInput
						label="Preview text"
						description="Choose the preview text for the email newsletter"
						placeholder="Enter preview text here..."
						value={field.value}
						update={field.onChange}
						softLimit={previewLimits.recommended}
						hardLimit={previewLimits.editorialLimit}
						error={fieldState.error?.message}
					/>
				)}
			/>
		</>
	);
};
