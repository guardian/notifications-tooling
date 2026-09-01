import { semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { activePillTheme } from '../themes';
import type { ChannelOption, DeliveryOption } from '../types';

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

const phoneIphoneIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
	>
		<path d="M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
	</svg>
);

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
