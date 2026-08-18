import { Option, Select } from '@guardian/stand/Select';
import { useContext, useState } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { alertTypeNameMap } from '../option-values';
import type { AlertType } from '../types';
import type { Edition } from '../types';
import { SelectableEditions } from './SelectableEditions';

const toOptionKey = (value: string, name = 'alertType') => `${name}//${value}`;

export const AlertEditionsSection = () => {
	const { updateNotification } = useContext(NotificationFormContext);

	// const appPushParameters =
	// 	notification.parameters?.type === 'push'
	// 		? notification.parameters
	// 		: undefined;
	// const alertType = appPushParameters?.alertType ?? 'breaking-news';
	// const editions = appPushParameters?.editions ?? [];

	const [alertType, setAlertType] = useState<AlertType>('breaking-news'); //TODO - change to notification.parameters.alertType
	const [alertEditions, setAlertEditions] = useState<Edition[]>([]); //TODO - change to notification.parameters.alertEditions

	return (
		<>
			<Select
				name="alertType"
				label="Alert type"
				description="Choose the type of app alert"
				onChange={(key) => {
					const selectedAlertType =
						typeof key === 'string' ? key.split('//').at(1) : undefined;
					switch (selectedAlertType) {
						case 'breaking-news':
						case 'sport':
						case 'editors-picks':
						case 'one-not-to-miss':
							setAlertType(selectedAlertType);
							return;
							updateNotification({
								type: 'modify-app-alert-parameters',
								appMod: { alertType: selectedAlertType as AlertType },
							});
					}
				}}
				selectionMode="single"
				value={toOptionKey(alertType)}
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
			</Select>
			<SelectableEditions
				title={'Editions'}
				description={'Choose the editions the app alert will be sent to'}
				selected={alertEditions} //Replace with edition values from notification.parameters.editions
				onChange={(newEdition) => {
					setAlertEditions(newEdition);
					updateNotification({
						type: 'modify-app-alert-parameters',
						appMod: { editions: newEdition },
					});
				}}
			/>
		</>
	);
};
