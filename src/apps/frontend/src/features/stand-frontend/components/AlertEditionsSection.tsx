import { Option, Select } from '@guardian/stand/Select';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { alertTypeNameMap } from '../option-values';

const toOptionKey = (value: string, name = 'alertType') => `${name}//${value}`;

export const AlertEditionsSection = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	const { alertType } = notification.parameters;

	return (
		<>
			<Select
				name="alertType"
				label="Alert type"
				description="Choose the type of app alert"
				onChange={(key) => {
					const alertType =
						typeof key === 'string' ? key.split('//').at(1) : undefined;
					switch (alertType) {
						case 'breaking-news':
						case 'sport':
						case 'editors-picks':
						case 'one-not-to-miss':
							return updateNotification({
								type: 'modify-app-alert-parameters',
								appMod: { alertType },
							});
						default:
							return updateNotification({
								type: 'modify-app-alert-parameters',
								appMod: { alertType: undefined },
							});
					}
				}}
				selectionMode="single"
				value={toOptionKey(alertType ?? 'undefined')}
			>
				<Option id={toOptionKey('breaking-news')}>
					{alertTypeNameMap['breaking-news']}
				</Option>
				<Option id={toOptionKey('sport')}>{alertTypeNameMap['sport']}</Option>
				<Option id={toOptionKey('editors-picks')}>
					{alertTypeNameMap['editors-picks']}
				</Option>
				<Option id={toOptionKey('one-not-to-miss')}>
					{alertTypeNameMap['one-not-to-miss']}
				</Option>
				<Option id={toOptionKey('undefined')}>
					{alertTypeNameMap['undefined']}
				</Option>
			</Select>
		</>
	);
};
