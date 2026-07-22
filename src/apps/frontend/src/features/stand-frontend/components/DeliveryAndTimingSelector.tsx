import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { activePillTheme } from '../themes';
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

			{selectedValues.length > 0 && (
				<div
					css={{
						display: 'flex',
						flexDirection: 'row',
						gap: semanticSpacing.stackSm,
					}}
				>
					{selectedValues.map((value) => {
						const iconValue = value === 'Immediate' ? 'bolt' : 'mail';
						return (
							<div key={value} css={activePillTheme.activePill}>
								<Icon
									size="md"
									symbol={iconValue}
									alt="send info"
									cssOverrides={activePillTheme.activePillIcon}
								/>
								<Typography variant={'headingCompactSm'}>
									{value === 'Immediate' ? 'Immediate send' : value}
								</Typography>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
