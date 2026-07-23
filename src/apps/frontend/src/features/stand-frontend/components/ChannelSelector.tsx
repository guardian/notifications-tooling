import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { ChannelOption } from '../types';
import { channelOptionNameMap } from '../types';
import { SelectableTile } from './SelectableTile';

interface ChannelSelectorProps {
	selectedChannel?: ChannelOption;
	onChange: (channel?: string) => void;
}

export const ChannelSelector = ({
	selectedChannel,
	onChange,
}: ChannelSelectorProps) => {
	return (
		<>
			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackXs,
				}}
			>
				<Typography variant="bodyBoldMd">Channel</Typography>
				<Typography
					variant="bodySm"
					css={{
						color: semanticColors.text.weak,
					}}
				>
					Choose the channel the notification is sent to
				</Typography>

				{Object.entries(channelOptionNameMap).map(
					([channelOption, { name, description, symbol }]) => (
						<SelectableTile
							key={channelOption}
							tileLabel={name}
							tileValue={channelOption}
							tileDescription={description}
							tileSymbol={symbol}
							selectedValue={selectedChannel}
							onChange={onChange}
						/>
					),
				)}
			</div>
		</>
	);
};
