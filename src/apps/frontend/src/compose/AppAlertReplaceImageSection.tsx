import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';
import { validateGuardianImageUrl } from '../utils/form-validation';

interface AppAlertReplaceImageSectionProps {
	replacementImageUrl: string;
	onReplacementImageUrlChange: (replacementImageUrl: string) => void;
	onUpdate: (replacementImageUrl: string) => void;
	errorMessage?: string;
}

const checkImageUrlExists = async (
	imageUrl: string,
): Promise<{ exists: boolean; error?: string }> => {
	if (!imageUrl.trim()) {
		return { exists: false, error: 'Image URL is empty' };
	}

	try {
		const response = await fetch(imageUrl, {
			method: 'HEAD',
		});

		if (!response.ok) {
			const statusText = response.statusText || `HTTP ${response.status}`;
			return {
				exists: false,
				error: `Image URL returned ${statusText}`,
			};
		}

		return { exists: true };
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : 'Network error or CORS issue';
		return { exists: false, error: `Unable to verify image: ${errorMessage}` };
	}
};

export const AppAlertReplaceImageSection = ({
	replacementImageUrl,
	onReplacementImageUrlChange,
	onUpdate,
	errorMessage,
}: AppAlertReplaceImageSectionProps) => {
	const [imageUpdated, setImageUpdated] = useState(false);
	const [isCheckingImage, setIsCheckingImage] = useState(false);
	const [imageCheckError, setImageCheckError] = useState<string | null>(null);

	const trimmedReplacementImageUrl = replacementImageUrl.trim();
	const validationError = validateGuardianImageUrl(trimmedReplacementImageUrl);
	const displayedErrorMessage =
		validationError ?? imageCheckError ?? errorMessage;

	const handleUpdateClick = async () => {
		if (validationError) {
			setImageUpdated(false);
			return;
		}

		// If empty URL, fall back to original image
		if (!trimmedReplacementImageUrl) {
			onReplacementImageUrlChange('');
			setImageCheckError(null);
			onUpdate('');
			setImageUpdated(true);
			return;
		}

		// Clear previous error and check image
		setImageCheckError(null);
		setIsCheckingImage(true);

		const result = await checkImageUrlExists(trimmedReplacementImageUrl);
		setIsCheckingImage(false);

		if (result.error) {
			// Image fetch failed, fall back to original
			setImageCheckError(result.error);
			onUpdate('');
			return;
		}

		// Image is valid, proceed with update
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
						onReplacementImageUrlChange(url);
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
