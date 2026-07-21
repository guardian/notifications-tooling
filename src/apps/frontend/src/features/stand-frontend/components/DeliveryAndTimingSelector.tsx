import { css } from '@emotion/react';
import {
	baseColors,
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { IconButton } from '@guardian/stand/IconButton';
import { Typography } from '@guardian/stand/Typography';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import { Button } from '@guardian/stand/Button';

interface DeliveryAndTimingInfoPreviewProps {
	channel?: string;
	deliveryTiming?: string;
}

interface DeliveryAndTimingSelectorProps {
	selectedDeliveryTiming?: string;
	onChange: (deliveryTiming?: string) => void;
}

export const IMMEDIATE_DELIVERY_TIMING = 'Immediate send';

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
	deliveryIcon: css({
		backgroundColor: baseColors.magenta[900],
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
		borderRadius: semanticRadius.cornerSm,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		gap: `${baseSpacing['8Px']}`,
		height: '32px',
	}),
};

export const DeliveryAndTimingSelector = ({
	selectedDeliveryTiming,
	onChange,
}: DeliveryAndTimingSelectorProps) => {
	const isChecked = selectedDeliveryTiming === IMMEDIATE_DELIVERY_TIMING;
	const toggleChecked = () => {
		onChange(isChecked ? undefined : IMMEDIATE_DELIVERY_TIMING);
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
							onClick={(event) => event.stopPropagation()}
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
	const selectedValues = [channel, deliveryTiming].filter(
		(value): value is string => Boolean(value),
	);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Send info</Typography>

			{selectedValues.length > 0 ? (
				<ButtonGroup size="lg">
					{selectedValues.map((value) => {
						const iconValue=(value === 'Immediate send') ? 'bolt' : 'mail';
						return(<Button key={value} variant="tertiary" disabled cssOverrides={styles.deliveryIcon}>
							<Icon size="md" symbol={iconValue} alt="send info" />
							{value}
						</Button>)
				}
				)}
				</ButtonGroup>
			) : <div></div>}
		</div>
	);
};

