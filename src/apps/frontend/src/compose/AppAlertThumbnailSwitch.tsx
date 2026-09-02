import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { ToggleButton } from 'react-aria-components/ToggleButton';
import { ToggleSwitchTheme } from '../themes';

interface AppAlertThumbnailSwitchProps {
	isSelected: boolean;
	isDisabled?: boolean;
	onChange: (isSelected: boolean) => void;
}

export const AppAlertThumbnailSwitch = ({
	isSelected,
	isDisabled = false,
	onChange,
}: AppAlertThumbnailSwitchProps) => {
	return (
		<section>
			<div
				css={css({
					display: 'flex',
					flexDirection: 'row',
					gap: '8px',
					alignItems: 'center',
				})}
			>
				<ToggleButton
					aria-label="Show article thumbnail image"
					isDisabled={isDisabled}
					isSelected={isSelected}
					onChange={onChange}
					css={ToggleSwitchTheme.baseStyle(isSelected)}
				>
					<Icon
						symbol={isSelected ? 'check_circle' : 'circle'}
						cssOverrides={ToggleSwitchTheme.thumb(isSelected)}
					/>
				</ToggleButton>
				<Typography variant="labelFormInlineSm">
					Show article thumbnail image
				</Typography>
			</div>
			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackXs,
				}}
			>
				<Typography variant="labelFormSm">Replace image</Typography>
				<Typography
					variant="helpTextFormMd"
					cssOverrides={css({ color: semanticColors.text.weak })}
				>
					Copy and paste a Guardian image URL to replace the existing image
				</Typography>
				<div
					css={{
						display: 'flex',
						flexDirection: 'row',
						gap: semanticSpacing.stackXs,
						alignItems: 'center',
					}}
				>
					<TextInput
						name="replacementImageUrl"
						aria-label="replacement image URL"
						size="md"
						value={''}
						placeholder="Enter replacement image URL..."
						isDisabled={false}
					/>
					<Button
						type="button"
						isDisabled={false}
						icon="refresh"
						size="md"
						variant="secondary"
						onClick={() => {}}
					>
						Update
					</Button>
				</div>
			</div>
		</section>
	);
};
