import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useImageUrlCheck } from '../hooks/use-image-url-check';
import { validateGuardianImageUrl } from '../utils/form-validation';
import type { AppAlertFormValues } from '../utils/notification-forms';

export type AppAlertReplacementImageFormValues = AppAlertFormValues & {
	replacementImageUrl?: string;
};

interface AppAlertReplaceImageSectionProps {
	onUpdate: (replacementImageUrl: string) => void;
	errorMessage?: string;
}

export const AppAlertReplaceImageSection = ({
	onUpdate,
	errorMessage,
}: AppAlertReplaceImageSectionProps) => {
	const { clearErrors, control, setValue } =
		useFormContext<AppAlertReplacementImageFormValues>();
	const [imageUpdated, setImageUpdated] = useState(false);
	const { isCheckingImage, imageCheckError, checkImageUrl, clearError } =
		useImageUrlCheck();
	const replacementImageUrl =
		useWatch<AppAlertReplacementImageFormValues, 'replacementImageUrl'>({
			control,
			name: 'replacementImageUrl',
			defaultValue: '',
		}) ?? '';

	const trimmedReplacementImageUrl = replacementImageUrl.trim();
	const validationError = validateGuardianImageUrl(trimmedReplacementImageUrl);
	const imageCheckErrorForCurrentUrl =
		imageCheckError?.url === trimmedReplacementImageUrl
			? imageCheckError.message
			: null;
	const displayedErrorMessage =
		validationError ?? imageCheckErrorForCurrentUrl ?? errorMessage;

	const handleUpdateClick = async () => {
		if (validationError) {
			setImageUpdated(false);
			return;
		}

		if (!trimmedReplacementImageUrl) {
			setValue('replacementImageUrl', '', { shouldDirty: true });
			clearError();
			clearErrors('articleThumbnailUrl');
			onUpdate('');
			setImageUpdated(true);
			return;
		}

		const result = await checkImageUrl(trimmedReplacementImageUrl);

		if (!result.success) {
			setImageUpdated(false);
			return;
		}

		onUpdate(trimmedReplacementImageUrl);
		setImageUpdated(true);
	};

	return (
		<>
			<Typography
				variant="helpTextFormMd"
				cssOverrides={css({ color: semanticColors.text.weak })}
			>
				Copy and paste a Guardian image URL to replace the existing image
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
					isInvalid={!!displayedErrorMessage}
					size="md"
					value={replacementImageUrl}
					placeholder="Enter replacement image URL..."
					onChange={(url) => {
						setValue('replacementImageUrl', url, {
							shouldDirty: true,
						});
						clearErrors('articleThumbnailUrl');
						setImageUpdated(false);
					}}
					id="replacement-image-URL"
				/>
				<Button
					type="button"
					icon="refresh"
					size="md"
					variant="secondary"
					isDisabled={!!validationError || isCheckingImage}
					onClick={() => void handleUpdateClick()}
				>
					{isCheckingImage ? 'Checking...' : 'Update'}
				</Button>
			</div>

			{displayedErrorMessage && (
				<InlineMessage level="error">{displayedErrorMessage}</InlineMessage>
			)}

			{imageUpdated && replacementImageUrl && (
				<InlineMessage level="success">Image updated</InlineMessage>
			)}
		</>
	);
};
