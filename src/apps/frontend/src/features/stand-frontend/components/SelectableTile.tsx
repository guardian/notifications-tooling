import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { selectableTileTheme } from '../themes';

interface SelectableTileProps {
	tileLabel: string;
	tileDescription: string;
	tileSymbol?: string;
	selectedValue?: string;
	onChange: (selected?: string) => void;
}

export const SelectableTile = ({
	tileLabel,
	tileDescription,
	tileSymbol,
	selectedValue,
	onChange,
}: SelectableTileProps) => {
	const isChecked = selectedValue === tileLabel;
	const toggleChecked = () => {
		onChange(isChecked ? undefined : tileLabel);
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
						{tileSymbol && (
							<Icon
								size="md"
								symbol={tileSymbol}
								alt={tileLabel + tileDescription}
							/>
						)}
						<Typography
							variant="headingCompactSm"
							css={selectableTileTheme.titleStyle}
						>
							{tileLabel}
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
								alt={tileLabel + tileDescription}
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
						{tileDescription}
					</Typography>
				</div>
			</div>
		</>
	);
};
