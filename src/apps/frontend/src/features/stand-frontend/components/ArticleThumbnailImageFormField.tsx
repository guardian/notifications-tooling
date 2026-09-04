import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { replaceThumbnailButtonTheme } from '../themes';
import { AppAlertReplaceImageSection } from './AppAlertReplaceImageSection';
import { AppAlertThumbnailSwitch } from './AppAlertThumbnailSwitch';

export const ArticleThumbnailImageFormField = () => {
	const { control, setValue } = useFormContext<AppAlertFormValues>();
	const { notification } = useContext(NotificationFormContext);
	const originalArticleThumbnailUrl =
		notification.content?.fields?.thumbnail ?? '';
	const articleThumbnailUrl =
		useWatch<AppAlertFormValues, 'articleThumbnailUrl'>({
			control,
			name: 'articleThumbnailUrl',
			defaultValue: '',
		}) ?? '';
	const hasThumbnail = Boolean(articleThumbnailUrl);
	const [openReplaceSection, setOpenReplaceSection] = useState(false);
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
							onChange={(isSelected) => {
								field.onChange(isSelected);
								if (!isSelected) {
									setOpenReplaceSection(false);
								}
							}}
						/>
						{hasThumbnail && field.value && (
							<div
								css={{
									display: 'flex',
									flexDirection: 'column',
									paddingLeft: '12px',
									gap: semanticSpacing.stackXs,
								}}
							>
								<Button
									type="button"
									onClick={() => setOpenReplaceSection(!openReplaceSection)}
									variant="tertiary"
									theme={replaceThumbnailButtonTheme}
									cssOverrides={css({
										width: 'fit-content',
										padding: 0,
									})}
									aria-label="add replacement image URL button"
									aria-expanded={openReplaceSection}
								>
									<div
										css={{
											display: 'flex',
											flexDirection: 'row',
											gap: semanticSpacing.stackXs,
										}}
									>
										<Typography variant="labelFormSm">Replace image</Typography>
										<Icon
											size="md"
											symbol={
												openReplaceSection
													? 'keyboard_arrow_up'
													: 'keyboard_arrow_down'
											}
										/>
									</div>
								</Button>
								{openReplaceSection && (
									<AppAlertReplaceImageSection
										onUpdate={(replacementImageUrl) => {
											const nextThumbnailUrl =
												replacementImageUrl.trim() ||
												originalArticleThumbnailUrl;

											setValue('articleThumbnailUrl', nextThumbnailUrl, {
												shouldDirty: true,
												shouldValidate: true,
											});
											setValue('includeThumbnail', Boolean(nextThumbnailUrl), {
												shouldDirty: true,
												shouldValidate: true,
											});
										}}
									/>
								)}
							</div>
						)}
					</>
				)}
			/>
		</div>
	);
};
