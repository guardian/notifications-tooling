import { css } from '@emotion/react';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { ToggleButton } from 'react-aria-components/ToggleButton';
import { useFormContext, useWatch } from 'react-hook-form';
import {
	type AppAlertFormValues,
	defaultAppAlertFormValues,
} from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { ToggleSwitchTheme } from '../themes';

export const AppAlertThumbnailSwitch = () => {
	const { notification } = useContext(NotificationFormContext);
	const { setValue } = useFormContext<AppAlertFormValues>();
	const includeThumbnail = useWatch<AppAlertFormValues, 'includeThumbnail'>({
		name: 'includeThumbnail',
		defaultValue: defaultAppAlertFormValues.includeThumbnail,
	});
	const thumbnailImage = notification.content?.fields?.thumbnail;
	const hasThumbnail = Boolean(thumbnailImage);
	const selected = hasThumbnail && includeThumbnail;

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
				onChange={(isSelected) => {
					setValue('includeThumbnail', isSelected, { shouldDirty: true });
				}}
				css={ToggleSwitchTheme.baseStyle(selected)}
			>
				<Icon
					symbol={selected ? 'check_circle' : 'circle'}
					cssOverrides={ToggleSwitchTheme.thumb(selected)}
				/>
			</ToggleButton>
			<Typography variant="labelFormInlineSm">
				Show article thumbnail image
			</Typography>
		</div>
	);
};
