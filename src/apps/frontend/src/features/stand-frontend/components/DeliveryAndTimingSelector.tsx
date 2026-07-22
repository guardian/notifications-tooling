import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { selectableTileTheme } from '../themes';
import { SelectableTile } from './SelectableTile';

interface DeliveryAndTimingInfoPreviewProps {
	channel?: string;
	deliveryTiming?: string;
}

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

export const DeliveryAndTimingInfoPreview = ({
	channel,
	deliveryTiming,
}: DeliveryAndTimingInfoPreviewProps) => {
	const selectedValues = [channel, deliveryTiming].filter(
		(value): value is string => Boolean(value),
	);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Send info</Typography>

			{selectedValues.length > 0 ? (
				<ButtonGroup size="lg">
					{selectedValues.map((value) => {
						const iconValue = value === 'Immediate' ? 'bolt' : 'mail';
						return (
							<Button
								key={value}
								variant="tertiary"
								isDisabled={true}
								cssOverrides={selectableTileTheme.deliveryIcon}
							>
								<Icon size="md" symbol={iconValue} alt="send info" />
								{value === 'Immediate' ? 'Immediate send' : value}
							</Button>
						);
					})}
				</ButtonGroup>
			) : (
				<div></div>
			)}
		</div>
	);
};
