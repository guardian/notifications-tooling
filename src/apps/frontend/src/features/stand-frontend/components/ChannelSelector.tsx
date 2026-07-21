import { css } from '@emotion/react';
import {
	baseColors,
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { IconButton } from '@guardian/stand/IconButton';
import { Typography } from '@guardian/stand/Typography';

export const NEWSLETTER_CHANNEL = 'Newsletter email';

interface ChannelSelectorProps {
	selectedChannel?: string;
	onChange: (channel?: string) => void;
}

export const styles = {
	newsletterTile:(isChecked: boolean)=> css({
		borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		width: '450px',
		height: '74px',
		backgroundColor: baseColors.neutral['900'],
		display: 'flex',
		gap: semanticSpacing.stackXxs,
		flexDirection: 'column',
		backgroundColor: isChecked ? baseColors.magenta['900'] : 'transparent',
	}),
	iconRow: css({
		display: 'flex',
		flexDirection: 'row',
		padding: '8px 8px 8px 12px',
		gap: semanticSpacing.stackXs,
		alignItems: 'center',
	}),
	emailIcon: css({
		width: '20px',
		height: '20px',
		gap: '10px',
	}),
	newsletterTitle: css({
		gap: '10px',
	}),
};

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
					css={styles.newsletterTile(isChecked)}
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
					<div css={styles.iconRow}>
						<Icon size="md" symbol="mail" alt="Newsletter email" />
						<Typography variant="headingCompactSm" css={styles.newsletterTitle}>
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
