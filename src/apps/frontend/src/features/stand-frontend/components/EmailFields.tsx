import { Checkbox, CheckboxGroup } from '@guardian/stand/Checkbox';
import { Radio, RadioGroup } from '@guardian/stand/RadioGroup';
import { Option, Select } from '@guardian/stand/Select';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import type { AudienceSegment, EmailDeliveryOption } from '../types';
import {
	audienceSegmentNameMap,
	emailDeliveryOptionNameMap,
	kickerNameMap,
} from '../types';
import { NotificationTextInput } from './NotificationTextInput';

const toOptionKey = (value: string, name = 'kicker') => `${name}//${value}`;

export const EmailFields = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	if (notification.parameters?.type !== 'email') {
		return null;
	}

	const {
		kicker,
		subject = '',
		preview = '',
		audienceSegments = [],
		emailDeliveryOption,
	} = notification.parameters;

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

			<CheckboxGroup
				label="Audience Segment"
				description="Choose the audience the email newsletter will be sent to"
				value={audienceSegments}
				onChange={(newValue) => {
					updateNotification({
						type: 'modify-email-parameters',
						mod: { audienceSegments: newValue as AudienceSegment[] },
					});
				}}
			>
				{Object.entries(audienceSegmentNameMap).map(([segment, name]) => (
					<Checkbox key={segment} value={segment}>
						{name}
					</Checkbox>
				))}
			</CheckboxGroup>

			<RadioGroup
				label="Delivery and timing"
				description="Choose whether the app alert is sent immediately or scheduled for later"
				value={emailDeliveryOption ?? null}
				onChange={(newValue) => {
					updateNotification({
						type: 'modify-email-parameters',
						mod: { emailDeliveryOption: newValue as EmailDeliveryOption },
					});
				}}
			>
				{Object.entries(emailDeliveryOptionNameMap).map(
					([deliveryOption, { name }]) => (
						<Radio key={deliveryOption} value={deliveryOption}>
							{name}
						</Radio>
					),
				)}
			</RadioGroup>
		</>
	);
};
