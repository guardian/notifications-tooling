import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { IconButton } from '@guardian/stand/IconButton';
import { Typography } from '@guardian/stand/Typography';
import { selectableTileTheme } from '../themes';

export const NEWSLETTER_CHANNEL = 'Newsletter email';

interface ChannelSelectorProps {
	selectedChannel?: string;
	onChange: (channel?: string) => void;
}

export const ChannelSelector = ({
	selectedChannel,
	onChange,
}: ChannelSelectorProps) => {
	const isChecked = selectedChannel === NEWSLETTER_CHANNEL;
	const toggleChecked = () => {
		onChange(isChecked ? undefined : NEWSLETTER_CHANNEL);
	};

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
				<div
					css={selectableTileTheme.selectableTile(isChecked)}
					onClick={toggleChecked}
					role="button"
					tabIndex={0}
					aria-pressed={isChecked}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							toggleChecked();
						}
					}}
				>
					<div css={selectableTileTheme.iconRow}>
						<Icon size="md" symbol="mail" alt="Newsletter email" />
						<Typography
							variant="headingCompactSm"
							css={selectableTileTheme.newsletterTitle}
						>
							{NEWSLETTER_CHANNEL}
						</Typography>
						<div
							css={css({
								height: '32px',
								width: '32px',
								marginLeft: 'auto',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							})}
							onClick={(event) => event.stopPropagation()}
						>
							<IconButton
								onPress={toggleChecked}
								symbol={
									isChecked ? 'radio_button_checked' : 'radio_button_unchecked'
								}
								ariaLabel="newsletter email"
								variant="tertiary"
								size="sm"
								cssOverrides={css({
									border: 'none',
								})}
							/>
						</div>
					</div>
					<Typography
						variant="bodySm"
						css={{
							color: semanticColors.text.weak,
							padding: `0px ${semanticSpacing.stackSm} 12px ${semanticSpacing.stackSm}`,
						}}
					>
						Sends via the Braze breaking-news campaign
					</Typography>
				</div>
			</div>
		</>
	);
};
