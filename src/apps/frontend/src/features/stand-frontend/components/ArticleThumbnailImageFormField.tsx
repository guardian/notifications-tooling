import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { ToggleButton } from 'react-aria-components/ToggleButton';
import { Controller, useFormContext } from 'react-hook-form';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { ToggleSwitchTheme } from '../themes';

export const ArticleThumbnailImageFormField = () => {
	const { notification } = useContext(NotificationFormContext);
	const { control } = useFormContext<AppAlertFormValues>();
	const thumbnailImage = notification.content?.fields?.thumbnail;
	const hasThumbnail = Boolean(thumbnailImage);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="labelFormMd">Article thumbnail image</Typography>
			<Controller
				control={control}
				name="includeThumbnail"
				render={({ field }) => {
					const selected = hasThumbnail && field.value;

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
								onChange={field.onChange}
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
				}}
			/>
		</div>
	);
};
