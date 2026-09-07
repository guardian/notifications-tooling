import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { replaceThumbnailButtonTheme } from '../themes';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { AppAlertReplaceImageSection } from './AppAlertReplaceImageSection';
import { AppAlertThumbnailSwitch } from './AppAlertThumbnailSwitch';
import { NotificationFormContext } from './NotificationContext';

export const ArticleThumbnailImageFormField = () => {
	const {
		control,
		formState: { errors },
		setValue,
		trigger,
	} = useFormContext<AppAlertFormValues>();
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
	const [replacementImageUrl, setReplacementImageUrl] = useState('');
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
								if (!isSelected && !replacementImageUrl.trim()) {
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
										replacementImageUrl={replacementImageUrl}
										onReplacementImageUrlChange={setReplacementImageUrl}
										errorMessage={errors.articleThumbnailUrl?.message}
										onUpdate={async (replacementImageUrl) => {
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

											return trigger('articleThumbnailUrl');
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
