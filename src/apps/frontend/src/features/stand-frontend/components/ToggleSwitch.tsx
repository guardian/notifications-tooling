import { css } from '@emotion/react';
import { baseColors, semanticColors } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ResolvedArticle } from '@models';
import { useState } from 'react';
import { ToggleButton } from 'react-aria-components/ToggleButton';

interface ToggleSwitchProps {
	content: ResolvedArticle;
}
const ToggleButtonTheme = {
	baseStyle: (selected: boolean) =>
		css({
			display: 'flex',
			alignItems: 'center',
			width: '44px',
			height: '24px',
			borderRadius: '100px',
			padding: '3px',
			gap: '10px',
			backgroundColor: selected
				? baseColors.magenta[200]
				: semanticColors.fill.neutralWeak,
		}),
	thumb: css({
		width: '18px',
		height: '18px',
		paddingLeft: '16px',
		color: semanticColors.bg.base,
	}),
};
export const ToggleSwitch = ({content}: ToggleSwitchProps) => {
	const { fields } = content;
	const thumbnailImage = fields?.thumbnail ?? undefined;
	const [selected, setSelected] = useState(thumbnailImage !== undefined);

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
				isSelected={selected}
				onChange={setSelected}
				css={ToggleButtonTheme.baseStyle(selected)}
			>
				{selected && (
					<Icon
						symbol={'check_circle'}
						cssOverrides={ToggleButtonTheme.thumb}
					></Icon>
				)}
			</ToggleButton>
			<Typography variant="labelFormInlineSm">
				Show article thumbnail image
			</Typography>
		</div>
	);
};
