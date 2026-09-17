import { z } from 'zod';

const specification = z.object({
	aspectRatio: z.string().optional(),
	bounds: z
		.object({
			x: z.number().optional(),
			y: z.number().optional(),
			width: z.number(),
			height: z.number(),
		})
		.optional(),
});
type Specification = z.infer<typeof specification>;

const cropAsset = z.object({
	secureUrl: z.string().optional(),
	file: z.string(),
	mimeType: z.string().optional(),
	dimensions: z
		.object({
			width: z.number().optional(),
			height: z.number().optional(),
		})
		.optional(),
});
type CropAsset = z.infer<typeof cropAsset>;

const cropData = z.object({
	id: z.string(),
	specification: specification.optional(),
	master: cropAsset.optional(),
	assets: z.optional(cropAsset.array()),
});
type CropData = z.infer<typeof cropData>;

const imageData = z.object({
	id: z.string().optional(),
	metadata: z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
			byline: z.string().optional(),
			credit: z.string().optional(),
			copyrightNotice: z.string().optional(),
			suppliersReference: z.string().optional(),
			imageType: z.string().optional(),
		})
		.optional(),
	usageRights: z
		.object({
			category: z.string().optional(),
		})
		.optional(),
	identifiers: z
		.object({
			picdarUrn: z.string().optional(),
		})
		.optional(),
	exports: z.optional(cropData.array()),
});
type ImageData = z.infer<typeof imageData>;

const gridImage = z.object({
	uri: z.string().optional(),
	data: imageData.optional(),
});
type GridImage = z.infer<typeof gridImage>;

/**
 * TO DO export this model to composer.
 *
 * The same responses are modelled in composer, but with both
 * image and crop being optional. See:
 * composer/src/js/model/grid.ts
 *
 * However, this seems wrong - media-converter function
 * (eg createImageElementFromMediaData)
 * consumes the response but should fail if these properties are
 * undefined.
 *
 * see composer/src/js/services/embed/media-converter.ts
 *
 * Unsure if it would be safe to model more strictly - are there cases in
 * where the grid emits a message without images or without crops?
 * Does composer need to consume those incomplete messages somewhere?
 *
 * Have added .strict() to avoid messages from browser extensions being
 * interpreted as from the grid
 */
const gridImageResponse = z
	.object({
		image: gridImage.optional(),
		crop: z
			.object({
				data: cropData.optional(),
			})
			.optional(),
	})
	.strict();
type GridImageResponse = z.infer<typeof gridImageResponse>;

const gridImageCollectionResponse = z.object({
	images: gridImageResponse.array(),
});

const gridDataTransfer = z.object({
	'text/plain': z.string().optional(),
	'text/uri-list': z.string().optional(),
	'text/html': z.string().optional(),
	'application/vnd.mediaservice.kahuna.image': z.string().optional(),
	'application/vnd.asset-handle+json': z.string().optional(),
	'application/vnd.mediaservice.image+json': z.string().optional(),
	'application/vnd.mediaservice.kahuna.uri': z.string().optional(),
	'application/vnd.mediaservice.crops+json': z.string().optional(),
});

export {
	GridImageResponse,
	gridImageResponse,
	gridImageCollectionResponse,
	GridImage,
	gridImage,
	ImageData,
	cropData,
	CropData,
	CropAsset,
	Specification,
	gridDataTransfer,
};
