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

export const AppAlertReplaceImageSection = ({
	replacementImageUrl,
	onReplacementImageUrlChange,
	onUpdate,
	errorMessage,
}: AppAlertReplaceImageSectionProps) => {
	const [imageUpdated, setImageUpdated] = useState(false);
	const trimmedReplacementImageUrl = replacementImageUrl.trim();
	const validationError = validateGuardianImageUrl(trimmedReplacementImageUrl);
	const displayedErrorMessage = validationError ?? errorMessage;

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
					onClick={() => {
						if (validationError) {
							setImageUpdated(false);
							return;
						}
						onUpdate(trimmedReplacementImageUrl);
						setImageUpdated(true);
					}}
				>
					Update
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
