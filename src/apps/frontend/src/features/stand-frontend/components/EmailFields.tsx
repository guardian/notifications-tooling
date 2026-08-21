import { Option, Select } from '@guardian/stand/Select';
import { useContext } from 'react';
import type { useChannelConstraints } from '../api/useChannelConstraints';
import { NEWSLETTER_LIMIT_FALLBACKS } from '../api/useChannelConstraints';
import { validateNotificationForm } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import { kickerNameMap } from '../option-values';
import { NotificationTextInput } from './NotificationTextInput';

const toOptionKey = (value: string, name = 'kicker') => `${name}//${value}`;

interface EmailFieldsProps {
	constraints?: ReturnType<typeof useChannelConstraints>['data'];
}

export const EmailFields = ({ constraints }: EmailFieldsProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	if (notification.parameters?.type !== 'email') {
		return null;
	}

	const newsletter = constraints?.channels.newsletter;
	const subjectLimits =
		newsletter?.compose.subject ?? NEWSLETTER_LIMIT_FALLBACKS.title;
	const previewLimits =
		newsletter?.content.body ?? NEWSLETTER_LIMIT_FALLBACKS.body;
	const kicker = notification.parameters.kicker;
	const kickerName = kicker !== undefined ? kickerNameMap[kicker] + ` : ` : '';
	const { subject = '', preview = '' } = notification.parameters;
	const requiredFieldErrors = validateNotificationForm(notification);
	const shouldShowErrors = notification.hasAttemptedSend;
	return (
		<>
			<Select
				name="kicker"
				label="Kicker"
				description="Choose the kicker for the email newsletter"
				onChange={(key) => {
					const kicker =
						typeof key === 'string' ? key.split('//').at(1) : undefined;
					switch (kicker) {
						case 'breaking-news':
						case 'exclusive':
							return updateNotification({
								type: 'modify-email-parameters',
								mod: { kicker },
							});
						default:
							return updateNotification({
								type: 'modify-email-parameters',
								mod: { kicker: undefined },
							});
					}
				}}
				selectionMode="single"
				value={toOptionKey(kicker ?? 'undefined')}
			>
				<Option id={toOptionKey('breaking-news')}>
					{kickerNameMap['breaking-news']}
				</Option>
				<Option id={toOptionKey('exclusive')}>
					{kickerNameMap['exclusive']}
				</Option>
				<Option id={toOptionKey('undefined')}>
					{kickerNameMap['undefined']}
				</Option>
			</Select>

			<NotificationTextInput
				label="Subject"
				description="Choose the subject line (kicker included in character count)"
				placeholder={`${kickerName}${''}Enter a subject line here...`}
				value={subject}
				update={(subject) =>
					updateNotification({
						type: 'modify-email-parameters',
						mod: { subject },
					})
				}
				softLimit={subjectLimits.recommended}
				hardLimit={subjectLimits.editorialLimit}
				error={
					shouldShowErrors && requiredFieldErrors.includes('subject')
						? 'Subject is required'
						: undefined
				}
			/>

			<NotificationTextInput
				label="Preview text"
				description="Choose the preview text for the email newsletter"
				placeholder="Enter preview text here..."
				value={preview}
				update={(preview) =>
					updateNotification({
						type: 'modify-email-parameters',
						mod: { preview },
					})
				}
				softLimit={previewLimits.recommended}
				hardLimit={previewLimits.editorialLimit}
				error={
					shouldShowErrors && requiredFieldErrors.includes('preview')
						? 'Preview text is required'
						: undefined
				}
			/>
		</>
	);
};
