import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { IconButton } from '@guardian/stand/IconButton';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { customIconButtonTheme } from '../themes';
import { AppAlertThumbnailSwitch } from './AppAlertThumbnailSwitch';

export const ArticleThumbnailImageFormField = () => {
	const { notification } = useContext(NotificationFormContext);
	const { control } = useFormContext<AppAlertFormValues>();
	const thumbnailImage = notification.content?.fields?.thumbnail;
	const hasThumbnail = Boolean(thumbnailImage);
	const [replacementImageUrl, setReplacementImageUrl] =
		useState(thumbnailImage);
	const replacementImageUrlToApply = replacementImageUrl?.trim();
	const canUpdateThumbnail =
		Boolean(replacementImageUrlToApply) &&
		replacementImageUrlToApply !== thumbnailImage;

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
					<>
						<AppAlertThumbnailSwitch
							isDisabled={!hasThumbnail}
							isSelected={hasThumbnail && field.value}
							onChange={field.onChange}
						/>
						{hasThumbnail && field.value && (
							<div
								css={{
									display: 'flex',
									flexDirection: 'column',
									paddingLeft: '12px',
								}}
							>
								<div
									css={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										gap: semanticSpacing.stackXs,
									}}
								>
									<Typography variant="labelFormSm">Replace image</Typography>
									<IconButton
										variant="tertiary"
										size="md"
										symbol="expand_more"
										ariaLabel="add replacement image URL"
										theme={customIconButtonTheme}
										width="12px"
									/>
								</div>
								<Typography
									variant="helpTextFormMd"
									cssOverrides={css({ color: semanticColors.text.weak })}
								>
									Copy and paste a Guardian image URL to replace the existing
									image
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
										value={replacementImageUrl}
										placeholder="Enter replacement image URL..."
										onChange={setReplacementImageUrl}
									/>
									<Button
										type="button"
										isDisabled={!canUpdateThumbnail}
										icon="refresh"
										size="md"
										variant="secondary"
										onClick={field.onChange}
									>
										Update
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			/>
		</div>
	);
};
