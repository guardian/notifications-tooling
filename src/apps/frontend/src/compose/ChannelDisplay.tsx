import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useId } from 'react';
import { selectableTileTheme } from '../themes';
import type { ChannelOption } from '../types';
import { channelOptionNameMap } from '../utils/option-values';

interface ChannelDisplayProps {
	channel: ChannelOption;
}

export const ChannelDisplay = ({ channel }: ChannelDisplayProps) => {
	const headingId = useId();
	const { customIcon, description, name, symbol } =
		channelOptionNameMap[channel];

	return (
		<section
			aria-labelledby={headingId}
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXxs,
			}}
		>
			<Typography id={headingId} variant="bodyBoldMd">
				Channel
			</Typography>
			<Typography variant="bodySm" css={{ color: semanticColors.text.weak }}>
				The channel the notification is sent to
			</Typography>

			<div css={selectableTileTheme.selectableTile(true)}>
				<div
					css={css({
						display: 'flex',
						flexDirection: 'column',
						minWidth: 0,
					})}
				>
					<div css={selectableTileTheme.iconRow}>
						{customIcon ? (
							<Icon size="md" alt={`${name} channel`}>
								{customIcon}
							</Icon>
						) : symbol ? (
							<Icon size="md" symbol={symbol} alt={`${name} channel`} />
						) : null}
						<Typography
							variant="headingCompactSm"
							css={selectableTileTheme.titleStyle}
						>
							{name}
						</Typography>
					</div>
					<Typography
						variant="bodySm"
						css={{
							color: semanticColors.text.weak,
							padding: `0 ${semanticSpacing.stackSm} 12px ${semanticSpacing.stackSm}`,
						}}
					>
						{description}
					</Typography>
				</div>
			</div>
		</section>
	);
};
