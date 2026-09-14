import { useCallback, useState } from 'react';

export type ImageUrlCheckResult = { exists: boolean; error?: string };

export const checkImageUrlExists = async (
	imageUrl: string,
): Promise<ImageUrlCheckResult> => {
	const trimmedImageUrl = imageUrl.trim();

	if (!trimmedImageUrl) {
		return { exists: false, error: 'Image URL is empty' };
	}

	try {
		const response = await fetch(trimmedImageUrl, {
			method: 'HEAD',
		});

		if (!response.ok) {
			const statusSummary = response.statusText
				? `HTTP ${response.status} ${response.statusText}`
				: `HTTP ${response.status}`;
			return {
				exists: false,
				error: `Image URL returned ${statusSummary}`,
			};
		}

		return { exists: true };
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : 'Network error or CORS issue';
		return {
			exists: false,
			error: `Unable to verify image: ${errorMessage}`,
		};
	}
};

export const useImageUrlCheck = () => {
	const [isCheckingImage, setIsCheckingImage] = useState(false);
	const [imageCheckError, setImageCheckError] = useState<{
		url: string;
		message: string;
	} | null>(null);

	const clearError = useCallback(() => {
		setImageCheckError(null);
	}, []);

	const checkImageUrl = useCallback(
		async (imageUrl: string) => {
			const trimmedImageUrl = imageUrl.trim();
			clearError();
			setIsCheckingImage(true);

			try {
				const result = await checkImageUrlExists(trimmedImageUrl);

				if (!result.exists) {
					setImageCheckError({
						url: trimmedImageUrl,
						message: result.error ?? 'Image does not exist',
					});
					return { success: false as const, error: result.error };
				}

				return { success: true as const };
			} finally {
				setIsCheckingImage(false);
			}
		},
		[clearError],
	);

	return {
		isCheckingImage,
		imageCheckError,
		checkImageUrl,
		clearError,
	};
};
