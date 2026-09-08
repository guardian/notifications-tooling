import { css } from '@emotion/react';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { ToggleButton } from 'react-aria-components/ToggleButton';
import { ToggleSwitchTheme } from '../themes';

interface PreviewTextToggleProps {
	isSelected: boolean;
	onChange: (isSelected: boolean) => void;
}

const styles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: '4px',
	}),
	row: css({
		display: 'flex',
		flexDirection: 'row',
		gap: '8px',
		alignItems: 'center',
	}),
};

export const PreviewTextToggle = ({
	isSelected,
	onChange,
}: PreviewTextToggleProps) => (
	<div css={styles.container}>
		<div css={styles.row}>
			<ToggleButton
				aria-label="Show preview text"
				isSelected={isSelected}
				onChange={onChange}
				css={ToggleSwitchTheme.baseStyle(isSelected)}
			>
				<Icon
					symbol={isSelected ? 'check_circle' : 'circle'}
					cssOverrides={ToggleSwitchTheme.thumb(isSelected)}
				/>
			</ToggleButton>
			<Typography variant="labelFormInlineSm">Show preview text</Typography>
		</div>
	</div>
);
