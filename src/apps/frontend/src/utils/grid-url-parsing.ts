const gridCropPathPattern = /\/images\/([0-9a-f]{40})/i;
const gridCropParamPattern = /\d+_\d+_\d+_\d+/i;

type GridCropUrlValidationResult =
	| {
			success: true;
			details: {
				type: 'grid-url';
				cropId: string;
				imageId: string;
			};
	  }
	| {
			success: false;
			validationError?: string;
	  };

const gridUrlValidationMessages = {
	noConfig: 'No grid origin URL configured',
	notGridUrl: 'Please enter a valid Guardian image URL',
	wrongPage: 'Please enter the URL for a 5:4 crop page',
};

export const validateGridCropPageUrl = (
	imageUrl: string,
	gridOrigin: string | undefined,
): GridCropUrlValidationResult => {
	if (imageUrl.length === 0) {
		return { success: false };
	}

	try {
		const url = new URL(imageUrl);

		if (!gridOrigin) {
			return {
				success: false,
				validationError: gridUrlValidationMessages.noConfig,
			};
		}

		if (url.origin !== gridOrigin) {
			return {
				success: false,
				validationError: gridUrlValidationMessages.notGridUrl,
			};
		}

		const cropId = url.searchParams.get('crop') ?? '';
		if (
			!gridCropPathPattern.test(url.pathname) ||
			!gridCropParamPattern.test(cropId)
		) {
			return {
				success: false,
				validationError: gridUrlValidationMessages.wrongPage,
			};
		}

		return {
			success: true,
			details: {
				type: 'grid-url',
				cropId,
				imageId: url.pathname.split('/').pop() ?? '',
			},
		};
	} catch {
		return {
			success: false,
			validationError: gridUrlValidationMessages.notGridUrl,
		};
	}
};
