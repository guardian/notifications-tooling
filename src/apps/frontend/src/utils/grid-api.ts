import type { CropAsset, CropData, ImageData } from '@models';
import { gridImage } from '@models';

export type GridErrorRemedy = 'authenticate' | 'contact-cp';

type Failure = {
	success: false;
	errorMessage: string;
	remedy?: GridErrorRemedy;
};

type Result<T> = { success: true; data: T } | Failure;

const failWith = (errorMessage: string, remedy?: GridErrorRemedy): Failure => ({
	success: false,
	errorMessage,
	remedy,
});

// TO DO - user friendly messages or use an enum
const errorMessages = {
	notFound: 'The image requested was not found on the grid',
	forbidden: 'Your Authentication credentials for the grid have expired',
	fetchFailure:
		'Failed to retrieve the image details from the grid. Please try again',
	parseFailure: 'The response from the grid was not in the expected format',
	cropMissing: 'The crop requested was could not found on the grid',
	noAsset: 'The crop requested did not include a suitable image asset',
	wrongAspect: 'Please choose a 5:4 image crop',
};

// TO DO - what is our desired size?
const DESIRED_MINIMUM_ASSET_WIDTH = 200;

const fetchImageData = async (
	gridApiUri: string | undefined,
	imageId: string,
): Promise<Result<ImageData>> => {
	const response = await fetch(`${gridApiUri}/images/${imageId}`, {
		credentials: 'include',
	}).catch((err) => {
		console.error('grid fetch failed', err);
		return undefined;
	});
	if (!response?.ok) {
		if (response?.status === 404) {
			return failWith(errorMessages.notFound);
		}
		if (response?.status === 403 || response?.status === 401) {
			return failWith(errorMessages.forbidden, 'authenticate');
		}

		return failWith(errorMessages.fetchFailure);
	}

	const json: unknown = await response.json().catch((err) => {
		console.error('json parse failed', err);
		return undefined;
	});
	const gridImageParseResult = gridImage.safeParse(json);
	if (!gridImageParseResult.success) {
		console.warn('parse failure', json, gridImageParseResult.error.issues);
		return failWith(errorMessages.parseFailure, 'contact-cp');
	}

	if (!gridImageParseResult.data.data) {
		return failWith(errorMessages.parseFailure, 'contact-cp');
	}
	return { success: true, data: gridImageParseResult.data.data };
};

const findCrop = (imageData: ImageData, cropId: string): Result<CropData> => {
	const crop = imageData.exports?.find((crop) => crop.id === cropId);
	if (!crop) {
		return failWith(errorMessages.cropMissing);
	}
	return {
		success: true,
		data: crop,
	};
};

const extractAsset = (crop: CropData): Result<CropAsset> => {
	const assetsSmallestFirst = crop.assets?.sort(
		(assetA, assetB) =>
			(assetA.dimensions?.width ?? 0) - (assetB.dimensions?.width ?? 0),
	);
	const assetToUse =
		assetsSmallestFirst?.find(
			(asset) =>
				asset.dimensions?.width &&
				asset.dimensions.width >= DESIRED_MINIMUM_ASSET_WIDTH,
		) ?? assetsSmallestFirst?.pop();

	if (!assetToUse) {
		return failWith(errorMessages.noAsset, 'contact-cp');
	}

	return {
		success: true,
		data: assetToUse,
	};
};

const isFiveFourCrop = (crop: CropData): boolean | undefined => {
	const { specification, master } = crop;
	if (specification?.aspectRatio) {
		return specification.aspectRatio === '5:4';
	}

	const { width, height } = master?.dimensions ?? {};
	if (!width || !height) {
		return undefined;
	}
	const aspectRatio = width / height;
	return Math.abs(aspectRatio - 5 / 4) < 0.05;
};

export const getGridImageUrl = async (
	gridApiUri: string | undefined,
	cropId: string,
	imageId: string,
): Promise<Result<string>> => {
	const dataResult = await fetchImageData(gridApiUri, imageId);
	if (!dataResult.success) {
		return dataResult;
	}

	const cropResult = findCrop(dataResult.data, cropId);
	if (!cropResult.success) {
		return cropResult;
	}

	if (!isFiveFourCrop(cropResult.data)) {
		return failWith(errorMessages.wrongAspect);
	}

	const assetResult = extractAsset(cropResult.data);
	if (!assetResult.success) {
		return assetResult;
	}

	return {
		success: true,
		data: assetResult.data.file,
	};
};
