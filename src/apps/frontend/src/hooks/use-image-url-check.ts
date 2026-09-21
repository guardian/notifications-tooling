import { useState } from 'react';
import { parseImageSourceUrl } from '../utils/form-validation';
import type { GridErrorRemedy } from '../utils/grid-api';
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
	const [imageCheckRemedy, setImageCheckRemedy] = useState<GridErrorRemedy>();

	const trimmedImageUrl = imageUrl.trim();

	const validationResult = parseImageSourceUrl(
		trimmedImageUrl,
		gridUri,
		gridApiUri,
	);

	const handleImageUrlChange = (nextImageUrl: string) => {
		onImageUrlChange(nextImageUrl);
		setImageCheckError(undefined);
		setImageUpdated(false);
	};

	const checkAndUpdateImage = async () => {
		setImageCheckRemedy(undefined);
		if (!trimmedImageUrl) {
			onUpdate('');
			setImageUpdated(true);
			return;
		}

		if (validationResult.type === 'failure') {
			onUpdate('');
			setImageUpdated(false);
			return;
		}

		setIsCheckingImage(true);
		let imageUrlToUse = trimmedImageUrl;

		// if the url was validated as a grid crop, fetch the image url from the grid api
		if (validationResult.type === 'grid-url') {
			const { cropId, imageId, gridApiUri } = validationResult;
			const gridFetchResult = await getGridImageUrl(
				gridApiUri,
				cropId,
				imageId,
			);

			if (!gridFetchResult.success) {
				setImageCheckError(gridFetchResult.errorMessage);
				setImageCheckRemedy(gridFetchResult.remedy);
				onUpdate('');
				setIsCheckingImage(false);
				return;
			}
			imageUrlToUse = gridFetchResult.data;
		}

		try {
			const result = await checkImageUrl(imageUrlToUse);
			if (!result.exists) {
				setImageCheckError(result.error ?? 'Image does not exist');
				onUpdate('');
				setImageUpdated(false);
				return;
			}

			onUpdate(imageUrlToUse);
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
		isUpdateDisabled: !!validationResult.validationError || isCheckingImage,
		displayedErrorMessage:
			validationResult.validationError ?? imageCheckError ?? errorMessage,
		imageCheckRemedy,
	};
};
