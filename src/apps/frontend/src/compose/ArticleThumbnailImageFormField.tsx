import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AppAlertThumbnailSwitch } from './AppAlertThumbnailSwitch';
import type { AppAlertFormValues } from './notification-forms';
import { NotificationFormContext } from './NotificationContext';

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
				render={({ field }) => (
					<AppAlertThumbnailSwitch
						isDisabled={!hasThumbnail}
						isSelected={hasThumbnail && field.value}
						onChange={field.onChange}
					/>
				)}
			/>
		</div>
	);
};
