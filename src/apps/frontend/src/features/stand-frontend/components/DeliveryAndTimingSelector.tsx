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
import { useState } from 'react';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import { Button } from '@guardian/stand/Button';
import { DEFAULT_SEGMENTS, Segment } from './AudienceSegments';

interface DeliveryAndTimingInfoPreviewProps {
	channel?: string;
	deliveryTiming?: string;
}


export const styles = {
	newsletterTile: (isChecked: boolean) =>
		css({
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

export const DeliveryAndTimingSelector = () => {
	const [isChecked, setIsChecked] = useState(false);
	const toggleChecked = () => setIsChecked((current) => !current);

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
					Choose whether the app alert is sent immediately or scheduled for a later
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
						<Icon size="md" symbol="bolt" alt="delivery and timing" />
						<Typography variant="headingCompactSm" css={styles.newsletterTitle}>
							Immediate
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
						>
							<IconButton
								onPress={toggleChecked}
								symbol={
									isChecked ? 'radio_button_checked' : 'radio_button_unchecked'
								}
								ariaLabel="delivery and timing"
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
						Send right now via Braze
					</Typography>
				</div>
			</div>
		</>
	);
};

export const DeliveryAndTimingInfoPreview = ({
	channel,
	deliveryTiming,
}:DeliveryAndTimingInfoPreviewProps) => {
	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Send info</Typography>

			<ButtonGroup size="lg">
				<Button
					key={channel}
					variant="tertiary"
				>
					{deliveryTiming}
				</Button>
				<Button
					key={deliveryTiming}
					variant="tertiary"
				>
					{channel}
				</Button>
			</ButtonGroup>
		</div>
	);
};

