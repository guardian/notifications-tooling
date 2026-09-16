import { css } from '@emotion/react';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { ToggleButton } from 'react-aria-components/ToggleButton';
import { toggleSwitchTheme } from '../themes';

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
				css={toggleSwitchTheme.baseStyle(isSelected)}
			>
				<Icon
					symbol={isSelected ? 'check_circle' : 'circle'}
					cssOverrides={toggleSwitchTheme.thumb(isSelected)}
				/>
			</ToggleButton>
			<Typography variant="labelFormInlineSm">
				Show article thumbnail image
			</Typography>
		</div>
	);
};
