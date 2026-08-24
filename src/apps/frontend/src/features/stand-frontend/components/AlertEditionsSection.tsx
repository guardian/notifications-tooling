import { Option, Select } from '@guardian/stand/Select';
import { useContext } from 'react';
import { validateAppAlertForm } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import { alertTypeNameMap } from '../option-values';
import { DEFAULT_EDITIONS } from './segment-options';
import { SegmentPicker } from './SegmentPicker';

const toOptionKey = (value: string, name = 'alertType') => `${name}//${value}`;

export const AlertEditionsSection = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const appPushParameters =
		notification.parameters?.type === 'push'
			? notification.parameters
			: undefined;
	const alertType = appPushParameters?.alertType ?? 'breaking-news';
	const alertEditions = appPushParameters?.editions ?? [];

	const requiredFieldErrors = validateAppAlertForm(notification);
	const shouldShowErrors = notification.hasAttemptedSend;
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
							updateNotification({
								type: 'modify-app-alert-parameters',
								appMod: { alertType: selectedAlertType },
							});
							return;
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
			<SegmentPicker
				title={'Editions'}
				description={'Choose the editions the app alert will be sent to'}
				options={DEFAULT_EDITIONS}
				selected={alertEditions}
				onChange={(newEdition) => {
					updateNotification({
						type: 'modify-app-alert-parameters',
						appMod: { editions: newEdition },
					});
				}}
				error={
					shouldShowErrors && requiredFieldErrors.includes('editions')
						? 'Please select an edition'
						: undefined
				}
			/>
		</>
	);
};
