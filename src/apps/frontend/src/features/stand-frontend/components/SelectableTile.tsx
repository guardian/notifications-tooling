import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ComponentProps } from 'react';
import { selectableTileTheme } from '../themes';

type IconSymbol = ComponentProps<typeof Icon>['symbol'];
interface SelectableTileProps {
	tileLabel: string;
	tileDescription: string;
	tileValue: string;
	tileSymbol?: IconSymbol;
	selectedValue?: string;
	onChange: (selected?: string) => void;
}

export const SelectableTile = ({
	tileLabel,
	tileDescription,
	tileValue,
	tileSymbol,
	selectedValue,
	onChange,
}: SelectableTileProps) => {
	const isChecked = selectedValue === tileValue;
	const toggleChecked = () => {
		onChange(isChecked ? undefined : tileValue);
	};

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Button
				onPress={toggleChecked}
				variant="tertiary"
				cssOverrides={selectableTileTheme.selectableTile(isChecked)}
				aria-pressed={isChecked}
			>
				<div
					css={css({
						display: 'flex',
						flexDirection: 'row',
						width: '100%',
					})}
				>
					<div
						css={css({
							display: 'flex',
							flexDirection: 'column',
							flex: 1,
							minWidth: 0,
						})}
					>
						<div css={selectableTileTheme.iconRow}>
							{tileSymbol && (
								<Icon
									size="md"
									symbol={tileSymbol}
									alt={`${tileLabel} ${tileDescription}`}
								/>
							)}
							<Typography
								variant="headingCompactSm"
								css={selectableTileTheme.titleStyle}
							>
								{tileLabel}
							</Typography>
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
						<Icon
							size="sm"
							symbol={
								isChecked ? 'radio_button_checked' : 'radio_button_unchecked'
							}
							cssOverrides={css({ border: 'none' })}
							alt={`${tileLabel} ${tileDescription}`}
						/>
					</div>
				</div>
			</Button>
		</div>
	);
};
