import { semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { activePillTheme } from '../themes';
import type { ChannelOption, DeliveryOption } from '../types';
import { phoneIphoneIcon } from './FlagIcons';

interface SendInfoPreviewPillProps {
	channel?: ChannelOption;
	deliveryTiming?: DeliveryOption;
	isConfirmation?: boolean;
	includeThumbnail?: boolean;
}

const getLabel = (value: ChannelOption | DeliveryOption) => {
	switch (value) {
		case 'immediate':
		case 'appImmediate':
			return 'Immediate send';
		case 'email':
			return 'Newsletter email';
		case 'push':
			return 'App alert';
		default:
			return value;
	}
};

const getIcon = (value: ChannelOption | DeliveryOption) => {
	switch (value) {
		case 'immediate':
		case 'appImmediate':
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
	includeThumbnail = false,
}: SendInfoPreviewPillProps) => {
	const selectedValues = [channel, deliveryTiming].filter(
		(value): value is ChannelOption | DeliveryOption => Boolean(value),
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
						flexWrap: 'wrap',
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
							{value === 'push' ? (
								<Icon
									size="md"
									alt={`${getLabel(value)} icon`}
									cssOverrides={activePillTheme.activePillIcon}
								>
									{phoneIphoneIcon}
								</Icon>
							) : (
								<Icon
									size="md"
									symbol={getIcon(value)}
									alt={`${getLabel(value)} icon`}
									cssOverrides={activePillTheme.activePillIcon}
								/>
							)}
							<Typography variant={'bodySm'}>{getLabel(value)}</Typography>
						</div>
					))}
					{includeThumbnail && channel === 'push' && (
						<div
							css={
								isConfirmation
									? activePillTheme.isConfirmationStyle
									: activePillTheme.activePill
							}
						>
							<Icon
								size="md"
								alt="Show article thumbnail image icon"
								cssOverrides={activePillTheme.activePillIcon}
								symbol="image"
							/>
							<Typography variant="bodySm">
								Show article thumbnail image
							</Typography>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
