import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { getChannelDescription } from '../../../util/display-text-helpers';
import { deliveryOptionNameMap } from '../option-values';
import type { ChannelOption } from '../types';
import { type DeliveryOption } from '../types';
import { SelectableTile } from './SelectableTile';

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
				Choose whether the {getChannelDescription(channel)} is sent immediately
				or scheduled for later
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
