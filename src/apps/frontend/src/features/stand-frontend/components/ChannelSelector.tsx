import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { channelOptionNameMap } from '../types';
import { SelectableTile } from './SelectableTile';

interface ChannelSelectorProps {
	selectedChannel?: string;
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

				<SelectableTile
					tileLabel={channelOptionNameMap['email'].name}
					tileValue="email"
					tileDescription={channelOptionNameMap['email'].description}
					tileSymbol={'mail'}
					selectedValue={selectedChannel}
					onChange={onChange}
				/>
			</div>
		</>
	);
};
