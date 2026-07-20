import { Option, Select } from '@guardian/stand/Select';
import { TextInput } from '@guardian/stand/TextInput';
import { useContext } from 'react';
import { NotificationContext } from '../NotificationContext';
import { CharacterCount } from './CharacterCount';

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
				<Option id={toOptionKey('breaking-news')}>Breaking News</Option>
				<Option id={toOptionKey('exclusive')}>Exclusive</Option>
				<Option id={toOptionKey('undefined')}>None</Option>
			</Select>

			<div>
				<TextInput
					label="Subject"
					description="Choose the subject line for the email newsletter"
					value={subject}
					onChange={(subject) =>
						updateNotification({
							type: 'modify-email-parameters',
							mod: { subject },
						})
					}
				/>
				<CharacterCount
					count={subject.length}
					softLimit={46}
					fieldDescription="subject line"
				/>
			</div>

			<div>
				<TextInput
					label="Preview text"
					description="Choose the preview text for the email newsletter"
					value={preview}
					onChange={(preview) =>
						updateNotification({
							type: 'modify-email-parameters',
							mod: { preview },
						})
					}
				/>
				<CharacterCount
					count={subject.length}
					softLimit={100}
					fieldDescription="preview text"
				/>
			</div>
		</>
	);
};
