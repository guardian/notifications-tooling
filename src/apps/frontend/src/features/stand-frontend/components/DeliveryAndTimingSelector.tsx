import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { getChannelDescription } from '../../../util/display-text-helpers';
import { emailDeliveryOptionNameMap } from '../option-values';
import type { ChannelOption } from '../types';
import { type EmailDeliveryOption } from '../types';
import { SelectableTile } from './SelectableTile';

interface DeliveryAndTimingSelectorProps {
	selectedDeliveryTiming?: EmailDeliveryOption;
	onChange: (deliveryTiming?: EmailDeliveryOption) => void;
	channel: ChannelOption;
}

export const DeliveryAndTimingSelector = ({
	selectedDeliveryTiming,
	onChange,
	channel,
}: DeliveryAndTimingSelectorProps) => {
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

			{Object.entries(emailDeliveryOptionNameMap).map(
				([emailDeliveryOption, { name, description, symbol }]) => (
					<SelectableTile
						key={emailDeliveryOption}
						tileLabel={name}
						tileValue={emailDeliveryOption}
						tileDescription={description}
						tileSymbol={symbol}
						selectedValue={selectedDeliveryTiming}
						onChange={(selected) => {
							switch (selected) {
								case 'immediate':
									onChange(selected);
									break;
							}
						}}
					/>
				),
			)}
		</div>
	);
};
