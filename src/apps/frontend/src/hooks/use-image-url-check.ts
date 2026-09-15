export type ImageUrlCheckResult = { exists: boolean; error?: string };

export const checkImageUrl = async (
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
