import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { ToggleSwitch } from '@guardian/stand/ToggleSwitch';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import {
	Controller,
	useController,
	useFormContext,
	useWatch,
} from 'react-hook-form';
import { replaceThumbnailButtonTheme } from '../themes';
import { toggleSwitchTheme } from '../themes';
import { getArticleThumbnail } from '../utils/article-thumbnail';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { AppAlertReplaceImageSection } from './AppAlertReplaceImageSection';
import { NotificationFormContext } from './NotificationFormContext';

interface ArticleThumbnailImageFormFieldProps {
	openReplaceSection: boolean;
	setOpenReplaceSection: (isOpen: boolean) => void;
}

export const ArticleThumbnailImageFormField = ({
	openReplaceSection,
	setOpenReplaceSection,
}: ArticleThumbnailImageFormFieldProps) => {
	const {
		clearErrors,
		control,
		formState: { errors },
		setValue,
	} = useFormContext<AppAlertFormValues>();
	const { field: replacementImageUrlField } = useController({
		control,
		name: 'replacementImageUrl',
	});
	const replacementImageUrl = replacementImageUrlField.value;
	const { composerState } = useContext(NotificationFormContext);
	const originalArticleThumbnailUrl =
		getArticleThumbnail(composerState.article).src ?? '';
	const articleThumbnailUrl =
		useWatch<AppAlertFormValues, 'articleThumbnailUrl'>({
			control,
			name: 'articleThumbnailUrl',
			defaultValue: '',
		}) ?? '';
	const hasThumbnail = Boolean(
		articleThumbnailUrl || originalArticleThumbnailUrl,
	);

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
						<ToggleSwitch
							size="sm"
							isSelected={hasThumbnail && field.value}
							onChange={(isSelected) => {
								field.onChange(isSelected);
								if (!isSelected && !replacementImageUrl.trim()) {
									setOpenReplaceSection(false);
								}
							}}
							aria-label="Show article thumbnail image"
							theme={toggleSwitchTheme}
						>
							Show article thumbnail image
						</ToggleSwitch>
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
										onReplacementImageUrlChange={(replacementImageUrl) => {
											replacementImageUrlField.onChange(replacementImageUrl);
											clearErrors('articleThumbnailUrl');
										}}
										errorMessage={errors.articleThumbnailUrl?.message}
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
