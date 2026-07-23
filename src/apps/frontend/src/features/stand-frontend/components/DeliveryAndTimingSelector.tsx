import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { type EmailDeliveryOption, emailDeliveryOptionNameMap } from '../types';
import { SelectableTile } from './SelectableTile';

interface DeliveryAndTimingSelectorProps {
	selectedDeliveryTiming?: EmailDeliveryOption;
	onChange: (deliveryTiming?: EmailDeliveryOption) => void;
}

export const DeliveryAndTimingSelector = ({
	selectedDeliveryTiming,
	onChange,
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
				Choose whether the app alert is sent immediately or scheduled for a
				later
			</Typography>
			<SelectableTile
				tileLabel={emailDeliveryOptionNameMap['immediate'].name}
				tileValue={'immediate'}
				tileDescription={emailDeliveryOptionNameMap['immediate'].description}
				tileSymbol={'bolt'}
				selectedValue={selectedDeliveryTiming}
				onChange={(selected) => {
					switch (selected) {
						case 'immediate':
							onChange(selected);
							break;
					}
				}}
			/>
		</div>
	);
};
