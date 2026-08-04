import { semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { activePillTheme } from '../themes';
import type { ChannelOption, EmailDeliveryOption } from '../types';

interface SendInfoPreviewPillProps {
	channel?: ChannelOption;
	deliveryTiming?: EmailDeliveryOption;
	isConfirmation?: boolean;
}

const getLabel = (value: ChannelOption | EmailDeliveryOption) => {
	switch (value) {
		case 'immediate':
			return 'Immediate send';
		case 'email':
			return 'Newsletter email';
		default:
			return value;
	}
};

const getIcon = (value: ChannelOption | EmailDeliveryOption) => {
	switch (value) {
		case 'immediate':
			return 'bolt';
		case 'email':
			return 'mail';
		default:
			return 'mail';
	}
};

export const SendInfoPreviewPill = ({
	channel,
	deliveryTiming,
	isConfirmation = false,
}: SendInfoPreviewPillProps) => {
	const selectedValues = [channel, deliveryTiming].filter(
		(value): value is ChannelOption | EmailDeliveryOption => Boolean(value),
	);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			{!isConfirmation && (
				<Typography variant="bodyBoldMd">Send info</Typography>
			)}

			{selectedValues.length > 0 && (
				<div
					css={{
						display: 'flex',
						flexDirection: 'row',
						gap: semanticSpacing.stackSm,
					}}
				>
					{selectedValues.map((value) => (
						<div
							key={value}
							css={
								isConfirmation
									? activePillTheme.isConfirmationStyle
									: activePillTheme.activePill
							}
						>
							<Icon
								size="md"
								symbol={getIcon(value)}
								alt="send info email icon"
								cssOverrides={activePillTheme.activePillIcon}
							/>
							<Typography variant={'bodySm'}>{getLabel(value)}</Typography>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
