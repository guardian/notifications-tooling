import { Option, Select } from '@guardian/stand/Select';
import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';
import { kickerNameMap } from '../types';
import { NotificationTextInput } from './NotificationTextInput';

const toOptionKey = (value: string, name = 'kicker') => `${name}//${value}`;

export const EmailFields = () => {
	const { notification, updateNotification } = useContext(NotificationContext);

	if (notification.parameters?.type !== 'email') {
		return null;
	}

	const { kicker, subject = '', preview = '' } = notification.parameters;

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
							return updateNotification({
								type: 'modify-email-parameters',
								mod: { kicker },
							});
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
				description="Choose the subject line for the email newsletter"
				value={subject}
				update={(subject) =>
					updateNotification({
						type: 'modify-email-parameters',
						mod: { subject },
					})
				}
				softLimit={46}
			/>

			<NotificationTextInput
				label="Preview text"
				description="Choose the preview text for the email newsletter"
				value={preview}
				update={(preview) =>
					updateNotification({
						type: 'modify-email-parameters',
						mod: { preview },
					})
				}
				softLimit={100}
			/>
		</>
	);
};
