import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { selectableTileTheme } from '../themes';

interface DeliveryAndTimingInfoPreviewProps {
	channel?: string;
	deliveryTiming?: string;
}

interface DeliveryAndTimingSelectorProps {
	selectedDeliveryTiming?: string;
	onChange: (deliveryTiming?: string) => void;
}

export const IMMEDIATE_DELIVERY_TIMING = 'Immediate send';

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
					Choose whether the app alert is sent immediately or scheduled for a
					later
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
						<Icon size="md" symbol="bolt" alt="delivery and timing" />
						<Typography
							variant="headingCompactSm"
							css={selectableTileTheme.newsletterTitle}
						>
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
							<Icon
								size="sm"
								symbol={
									isChecked ? 'radio_button_checked' : 'radio_button_unchecked'
								}
								cssOverrides={css({
									border: 'none',
								})}
								alt="delivery and timing"
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
}: DeliveryAndTimingInfoPreviewProps) => {
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
						const iconValue = value === 'Immediate send' ? 'bolt' : 'mail';
						return (
							<Button
								key={value}
								variant="tertiary"
								isDisabled={true}
								cssOverrides={selectableTileTheme.deliveryIcon}
							>
								<Icon size="md" symbol={iconValue} alt="send info" />
								{value}
							</Button>
						);
					})}
				</ButtonGroup>
			) : (
				<div></div>
			)}
		</div>
	);
};
