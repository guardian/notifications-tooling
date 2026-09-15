export type ImageUrlCheckResult = { exists: boolean; error?: string };

export const checkImageUrl = async (
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
