import { useState } from 'react';
import { parseImageSourceUrl } from '../utils/form-validation';
import { getGridImageUrl } from '../utils/grid-api';

export type ImageUrlCheckResult = { exists: boolean; error?: string };

const checkImageUrl = async (
	imageUrl: string,
): Promise<ImageUrlCheckResult> => {
	const trimmedImageUrl = imageUrl.trim();

	if (!trimmedImageUrl) {
		return { exists: false, error: 'Image URL is empty' };
	}

	return await new Promise((resolve) => {
		const image = new Image();
		image.onload = () => resolve({ exists: true });
		image.onerror = () =>
			resolve({ exists: false, error: 'Unable to load image' });
		image.src = trimmedImageUrl;
	});
};

interface UseImageUrlCheckOptions {
	imageUrl: string;
	onImageUrlChange: (imageUrl: string) => void;
	onUpdate: (imageUrl: string) => void;
	errorMessage?: string;
	gridUri?: string;
	gridApiUri?: string;
}

export const useImageUrlCheck = ({
	imageUrl,
	onImageUrlChange,
	onUpdate,
	errorMessage,
	gridUri,
	gridApiUri,
}: UseImageUrlCheckOptions) => {
	const [imageUpdated, setImageUpdated] = useState(false);
	const [isCheckingImage, setIsCheckingImage] = useState(false);
	const [imageCheckError, setImageCheckError] = useState<string>();

	const trimmedImageUrl = imageUrl.trim();

	const validationResult = parseImageSourceUrl(trimmedImageUrl, gridUri);

	const handleImageUrlChange = (nextImageUrl: string) => {
		onImageUrlChange(nextImageUrl);
		setImageCheckError(undefined);
		setImageUpdated(false);
	};

	const checkAndUpdateImage = async () => {
		if (!trimmedImageUrl) {
			onUpdate('');
			setImageUpdated(true);
			return;
		}

		if (validationResult.relevantFailure) {
			onUpdate('');
			setImageUpdated(false);
			return;
		}

		setIsCheckingImage(true);

		// if the url was validated as a grid crop, fetch the image url from the grid api
		if (validationResult.gridCropUrlValidationResult.success) {
			const { cropId, imageId } = validationResult.gridCropUrlValidationResult;
			const result = await getGridImageUrl(gridApiUri, cropId, imageId);
			setIsCheckingImage(false);

			if (!result.success) {
				setImageCheckError(result.errorMessage);
				onUpdate('');
				setIsCheckingImage(false);
				return;
			}

			onUpdate(result.data);
			setImageUpdated(true);
			return;
		}

		try {
			const result = await checkImageUrl(trimmedImageUrl);
			if (!result.exists) {
				setImageCheckError(result.error ?? 'Image does not exist');
				onUpdate('');
				setImageUpdated(false);
				return;
			}

			onUpdate(trimmedImageUrl);
			setImageUpdated(true);
		} finally {
			setIsCheckingImage(false);
		}
	};

	return {
		checkAndUpdateImage,
		handleImageUrlChange,
		imageUpdated,
		isCheckingImage,
		isUpdateDisabled:
			Boolean(validationResult.relevantFailure) || isCheckingImage,
		displayedErrorMessage:
			validationResult.relevantFailure ?? imageCheckError ?? errorMessage,
	};
};
