import { Controller, useFormContext } from 'react-hook-form';
import { DeliveryAndTimingSelector } from '../send/DeliveryAndTimingSelector';
import type { ChannelOption } from '../types';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from './notification-forms';

interface DeliveryOptionFormFieldProps {
	channel: ChannelOption;
}

export const DeliveryOptionFormField = ({
	channel,
}: DeliveryOptionFormFieldProps) => {
	const { control } = useFormContext<
		AppAlertFormValues | NewsletterFormValues
	>();

	return (
		<Controller
			control={control}
			name="deliveryOption"
			render={({ field }) => (
				<DeliveryAndTimingSelector
					selectedDeliveryTiming={field.value}
					channel={channel}
					onChange={field.onChange}
				/>
			)}
		/>
	);
};
