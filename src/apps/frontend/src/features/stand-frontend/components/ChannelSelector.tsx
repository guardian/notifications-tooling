import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { channelOptionNameMap } from '../option-values';
import type { ChannelOption } from '../types';
import { SelectableTile } from './SelectableTile';

interface ChannelSelectorProps {
	selectedChannel?: ChannelOption;
	onChange: (channel?: string) => void;
}

export const ChannelSelector = ({
	selectedChannel = 'email',
	onChange,
}: ChannelSelectorProps) => {
	const selectedChannelParams = channelOptionNameMap[selectedChannel];
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

				<SelectableTile
					key={selectedChannel}
					tileLabel={selectedChannelParams.name}
					tileValue={selectedChannel}
					tileDescription={selectedChannelParams.description}
					tileSymbol={selectedChannelParams.symbol}
					selectedValue={selectedChannel}
					onChange={onChange}
				/>
			</div>
		</>
	);
};
