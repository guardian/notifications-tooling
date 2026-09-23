const gridCropPathPattern = /\/images\/([0-9a-f]{40})/i;
const gridCropParamPattern = /\d+_\d+_\d+_\d+/i;

type GridCropUrlValidationResult =
	| {
			success: true;
			details: {
				type: 'grid-url';
				cropId: string;
				imageId: string;
				gridApiUri: string;
			};
	  }
	| {
			success: false;
			validationError?: string;
	  };

const gridUrlValidationMessages = {
	noConfig: 'Missing configuration: gridApiUri or gridOrigin',
	notGridUrl: 'Please enter a valid Guardian image URL',
	notImageCropPage: 'Please enter the URL for a 5:4 crop page',
};

export const validateGridCropPageUrl = (
	imageUrl: string,
	gridOrigin: string | undefined,
	gridApiUri: string | undefined,
): GridCropUrlValidationResult => {
	if (imageUrl.length === 0) {
		return { success: false };
	}

	try {
		const url = new URL(imageUrl);

		if (!gridOrigin || !gridApiUri) {
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
				validationError: gridUrlValidationMessages.notImageCropPage,
			};
		}

		return {
			success: true,
			details: {
				type: 'grid-url',
				cropId,
				gridApiUri,
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
