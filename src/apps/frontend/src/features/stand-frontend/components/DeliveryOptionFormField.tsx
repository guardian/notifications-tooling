import { Controller, useFormContext } from 'react-hook-form';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from '../notification-forms';
import type { ChannelOption } from '../types';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';

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
