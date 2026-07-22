import { Radio, RadioGroup } from '@guardian/stand/RadioGroup';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import type { ChannelOption } from '../types';
import { channelOptionNameMap } from '../types';

export const ChannelOptions = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const channel = notification.parameters?.type;

	return (
		<RadioGroup
			label="Channel"
			description="Choose the channel the notification is sent to"
			value={channel ?? null}
			onChange={(channel) => {
				updateNotification({
					type: 'set-channel',
					channel: channel as ChannelOption,
				});
			}}
		>
			{Object.entries(channelOptionNameMap).map(
				([deliveryOption, { name }]) => (
					<Radio key={deliveryOption} value={deliveryOption}>
						{name}
					</Radio>
				),
			)}
		</RadioGroup>
	);
};
