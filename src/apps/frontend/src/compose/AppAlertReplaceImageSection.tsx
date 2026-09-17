import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { parseImageSourceUrl } from '../utils/form-validation';
import { getGridImageUrl } from '../utils/grid-api';

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
	const { gridApiUri, gridUri } = useContext(ConfigContext) ?? {};
	const [imageUpdated, setImageUpdated] = useState(false);
	const [isWaitingForGrid, setIsWaitingForGrid] = useState(false);
	const [gridImageError, setGridImageError] = useState<string>();
	const validationResult = parseImageSourceUrl(
		replacementImageUrl.trim(),
		gridUri,
	);
	const displayedErrorMessage =
		gridImageError ?? validationResult.relevantFailure ?? errorMessage;

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
						if (validationResult.gridCropUrlValidationResult.success) {
							const { cropId, imageId } =
								validationResult.gridCropUrlValidationResult;

							setGridImageError(undefined);
							setIsWaitingForGrid(true);
							void getGridImageUrl(gridApiUri, cropId, imageId).then(
								(result) => {
									setIsWaitingForGrid(false);
									if (!result.success) {
										console.error(result.error);
										setGridImageError(result.error.message);
										return;
									}
									onUpdate(result.data);
									setImageUpdated(true);
								},
							);
							return;
						}

						if (validationResult.guardianImageUrlValidationResult.success) {
							onUpdate(validationResult.guardianImageUrlValidationResult.url);
							setImageUpdated(true);
							return;
						}

						setImageUpdated(false);
					}}
				>
					Update
				</Button>
			</div>

			{displayedErrorMessage && (
				<InlineMessage level="error">{displayedErrorMessage}</InlineMessage>
			)}

			{isWaitingForGrid && (
				<div>
					<LoadingSpinner />
				</div>
			)}

			{imageUpdated && replacementImageUrl && (
				<InlineMessage level="success">Image updated</InlineMessage>
			)}
		</>
	);
};
