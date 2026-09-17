import { useState } from 'react';
import { validateGuardianImageUrl } from '../utils/form-validation';

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
}

export const useImageUrlCheck = ({
	imageUrl,
	onImageUrlChange,
	onUpdate,
	errorMessage,
}: UseImageUrlCheckOptions) => {
	const [imageUpdated, setImageUpdated] = useState(false);
	const [isCheckingImage, setIsCheckingImage] = useState(false);
	const [imageCheckError, setImageCheckError] = useState<string>();

	const trimmedImageUrl = imageUrl.trim();
	const validationError = validateGuardianImageUrl(trimmedImageUrl);

	const handleImageUrlChange = (nextImageUrl: string) => {
		onImageUrlChange(nextImageUrl);
		setImageCheckError(undefined);
		setImageUpdated(false);
	};

	const checkAndUpdateImage = async () => {
		if (validationError) {
			onUpdate('');
			setImageUpdated(false);
			return;
		}

		if (!trimmedImageUrl) {
			onUpdate('');
			setImageUpdated(true);
			return;
		}

		setIsCheckingImage(true);
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
		isUpdateDisabled: Boolean(validationError) || isCheckingImage,
		displayedErrorMessage: validationError ?? imageCheckError ?? errorMessage,
	};
};
