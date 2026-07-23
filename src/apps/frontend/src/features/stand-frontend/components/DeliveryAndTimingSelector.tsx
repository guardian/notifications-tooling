import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { ChannelOption } from '../types';
import { type EmailDeliveryOption, emailDeliveryOptionNameMap } from '../types';
import { SelectableTile } from './SelectableTile';

interface DeliveryAndTimingSelectorProps {
	selectedDeliveryTiming?: EmailDeliveryOption;
	onChange: (deliveryTiming?: EmailDeliveryOption) => void;
	channel: ChannelOption;
}

const channelDescriptions = {
	email: 'email newsletter',
	push: 'app alert',
};

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
				Choose whether the {channelDescriptions[channel]} is sent immediately or
				scheduled for a later
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
