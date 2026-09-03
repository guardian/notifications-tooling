import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { deliveryOptionNameMap } from '../option-values';
import type { ChannelOption } from '../types';
import { type DeliveryOption } from '../types';
import { getChannelDescription } from '../ui/display-text-helpers';
import { SelectableTile } from '../ui/SelectableTile';

interface DeliveryAndTimingSelectorProps {
	selectedDeliveryTiming?: DeliveryOption;
	onChange: (deliveryTiming?: string) => void;
	channel: ChannelOption;
}

export const DeliveryAndTimingSelector = ({
	selectedDeliveryTiming = 'immediate',
	onChange,
	channel,
}: DeliveryAndTimingSelectorProps) => {
	const selectedDeliveryAndTimingParams =
		deliveryOptionNameMap[selectedDeliveryTiming];
	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Delivery and timing</Typography>
			<Typography
				variant="bodySm"
				css={{
					color: semanticColors.text.weak,
				}}
			>
				The {getChannelDescription(channel)} is sent immediately
			</Typography>

			<SelectableTile
				key={selectedDeliveryTiming}
				tileLabel={selectedDeliveryAndTimingParams.name}
				tileValue={selectedDeliveryTiming}
				tileDescription={selectedDeliveryAndTimingParams.description}
				tileSymbol={selectedDeliveryAndTimingParams.symbol}
				selectedValue={selectedDeliveryTiming}
				onChange={onChange}
			/>
		</div>
	);
};
