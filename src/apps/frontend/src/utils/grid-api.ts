import type { CropAsset, ImageData } from '@models';
import { gridImage } from '@models';

type Result<T> = { success: true; data: T } | { success: false; error: Error };

// TO DO - what is our desired size?
const DESIRED_MINIMUM_ASSET_WIDTH = 200;

const fetchImageData = async (
	gridApiUri: string | undefined,
	imageId: string,
): Promise<Result<ImageData>> => {
	try {
		const response = await fetch(`${gridApiUri}/images/${imageId}`, {
			credentials: 'include',
		});
		const json: unknown = await response.json();
		const { data } = gridImage.parse(json);
		if (!data) {
			return {
				success: false,
				error: new Error('no image data'),
			};
		}
		return { success: true, data };
	} catch (exception) {
		return {
			success: false,
			error:
				exception instanceof Error ? exception : new Error('unknown exception'),
		};
	}
};

const extractAsset = (
	imageData: ImageData,
	cropId: string,
): Result<CropAsset> => {
	const crop = imageData.exports?.find((crop) => crop.id === cropId);
	if (!crop) {
		return {
			success: false,
			error: new Error('Could not find crop'),
		};
	}
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
		return {
			success: false,
			error: new Error('No assets'),
		};
	}

	return {
		success: true,
		data: assetToUse,
	};
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
	const assetResult = extractAsset(dataResult.data, cropId);
	if (!assetResult.success) {
		return assetResult;
	}

	return {
		success: true,
		data: assetResult.data.file,
	};
};
