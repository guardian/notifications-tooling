import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSizing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { ToggleButton } from 'react-aria-components/ToggleButton';
import { NotificationFormContext } from '../NotificationContext';

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
				: semanticColors.bg.raisedLevel3Inverse,
			border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		}),
	thumb: (selected: boolean) =>
		css({
			width: '18px',
			height: '18px',
			paddingLeft: selected ? '16px' : '0px',
			alignItems: 'center',
			color: semanticColors.bg.base,
		}),
};
export const ToggleSwitch = () => {
	const { notification } = useContext(NotificationFormContext);
	const thumbnailImage = notification.content?.fields?.thumbnail;
	const hasThumbnail = thumbnailImage !== undefined;
	const [selection, setSelection] = useState({
		thumbnailImage,
		selected: hasThumbnail,
	});
	const selected =
		selection.thumbnailImage === thumbnailImage
			? selection.selected
			: hasThumbnail;

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
				isDisabled={!hasThumbnail}
				isSelected={selected}
				onChange={(isSelected) =>
					setSelection({ selected: isSelected, thumbnailImage })
				}
				css={ToggleButtonTheme.baseStyle(selected)}
			>
				<Icon
					symbol={selected ? 'check_circle' : 'circle'}
					cssOverrides={ToggleButtonTheme.thumb(selected)}
				/>
			</ToggleButton>
			<Typography variant="labelFormInlineSm">
				Show article thumbnail image
			</Typography>
		</div>
	);
};
