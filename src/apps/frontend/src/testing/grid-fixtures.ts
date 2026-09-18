export const GRID_IMAGE_ID = '0123456789abcdef0123456789abcdef01234567';
export const GRID_CROP_ID = '100_200_300_400';

export const FIVE_FOUR_CROP_RESPONSE = {
	data: {
		exports: [
			{
				id: GRID_CROP_ID,
				specification: { aspectRatio: '5:4' },
				assets: [
					{
						file: `https://media.guim.co.uk/${GRID_IMAGE_ID}/${GRID_CROP_ID}/1000.jpg`,
						dimensions: { width: 1000, height: 800 },
					},
				],
			},
		],
	},
};
