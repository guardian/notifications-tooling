import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { SelectableTile } from './SelectableTile';

interface DeliveryAndTimingSelectorProps {
	selectedDeliveryTiming?: string;
	onChange: (deliveryTiming?: string) => void;
}

export const DeliveryAndTimingSelector = ({
	selectedDeliveryTiming,
	onChange,
}: DeliveryAndTimingSelectorProps) => {
	return (
		<>
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
					tileLabel={'Immediate'}
					tileDescription={'Send right now via Braze'}
					tileSymbol={'bolt'}
					selectedValue={selectedDeliveryTiming}
					onChange={onChange}
				/>
			</div>
		</>
	);
};
