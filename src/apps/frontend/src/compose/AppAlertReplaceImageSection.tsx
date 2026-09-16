import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { validateGridCropPageUrl } from '../utils/form-validation';

interface AppAlertReplaceImageSectionProps {
	replacementImageUrl: string;
	onReplacementImageUrlChange: (replacementImageUrl: string) => void;
	onUpdate: (replacementImageUrl: string) => void;
	errorMessage?: string;
}

type GridLookUpResult =
	{ success: true; imageUrl: string } | { success: false; error: Error };

const getGridImageUrl = async (
	gridApiUri: string | undefined,
	cropId: string,
	imageId: string,
): Promise<GridLookUpResult> => {
	// TO DO - query the grid api, extract the smallest version of the crop
	console.log('returning placeholder image instead of fetching from grid for', {
		gridApiUri,
		cropId,
		imageId,
	});
	return new Promise((resolve) => {
		setTimeout(
			() =>
				resolve({
					success: true,
					imageUrl:
						'https://media.guim.co.uk/70e4e976acdf31057677978113db2010c9e2c818/0_0_1261_1009/500.jpg',
				}),
			1000,
		);
	});
};

export const AppAlertReplaceImageSection = ({
	replacementImageUrl,
	onReplacementImageUrlChange,
	onUpdate,
	errorMessage,
}: AppAlertReplaceImageSectionProps) => {
	const { gridApiUri, gridUri } = useContext(ConfigContext) ?? {};
	const [imageUpdated, setImageUpdated] = useState(false);
	const [isProcessingUrl, setIsProcessingUrl] = useState(false);
	const validationResult = validateGridCropPageUrl(
		replacementImageUrl.trim(),
		gridUri,
	);
	const displayedErrorMessage =
		validationResult.validationError ?? errorMessage;

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
						if (!validationResult.success) {
							setImageUpdated(false);
							return;
						}

						const { cropId, imageId } = validationResult;

						setIsProcessingUrl(true);
						void getGridImageUrl(gridApiUri, cropId, imageId).then((result) => {
							if (!result.success) {
								alert('image process fail');
								console.error(result.error);
								return;
							}
							onUpdate(result.imageUrl);
							setImageUpdated(true);
							setIsProcessingUrl(false);
						});
					}}
				>
					Update
				</Button>
			</div>

			{displayedErrorMessage && (
				<InlineMessage level="error">{displayedErrorMessage}</InlineMessage>
			)}

			{isProcessingUrl && (
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
