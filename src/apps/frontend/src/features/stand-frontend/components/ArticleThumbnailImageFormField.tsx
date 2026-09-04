import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { replaceThumbnailButtonTheme } from '../themes';
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
	const [replacementImageUrl, setReplacementImageUrl] = useState('');
	const [openReplaceSection, setOpenReplaceSection] = useState(false);
	const thumbnailReplaced =
		hasThumbnail &&
		articleThumbnailUrl === replacementImageUrl &&
		replacementImageUrl !== '';
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
									gap: semanticSpacing.stackXs,
								}}
							>
								<Button
									onClick={() => setOpenReplaceSection(!openReplaceSection)}
									variant="tertiary"
									theme={replaceThumbnailButtonTheme}
									cssOverrides={css({
										width: 'fit-content',
										padding: 0,
									})}
									aria-label={`add replacement image URL button`}
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
									<>
										<Typography
											variant="helpTextFormMd"
											cssOverrides={css({ color: semanticColors.text.weak })}
										>
											Copy and paste a Guardian image URL to replace the
											existing image
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
												id="replacement-image-URL"
											/>
											<Button
												type="button"
												icon="refresh"
												size="md"
												variant="secondary"
												onClick={() => {
													const nextThumbnailUrl =
														replacementImageUrl || originalArticleThumbnailUrl;

													setValue('articleThumbnailUrl', nextThumbnailUrl, {
														shouldDirty: true,
														shouldValidate: true,
													});
													setValue(
														'includeThumbnail',
														Boolean(nextThumbnailUrl),
														{
															shouldDirty: true,
															shouldValidate: true,
														},
													);
												}}
											>
												Update
											</Button>
										</div>
										{thumbnailReplaced && (
											<InlineMessage level="success">
												Image updated
											</InlineMessage>
										)}
									</>
								)}
							</div>
						)}
					</>
				)}
			/>
		</div>
	);
};
