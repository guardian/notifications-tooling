import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { PickerIframeModal } from '@guardian/stand/PickerIframeModal';
import type { CropData, ImageData } from '@models';
import { gridImageResponse } from '@models';
import { useContext, useState } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { extractAsset, isFiveFourCrop } from '../grid-client/grid-api';

type ImageAndCrop = {
	crop: CropData;
	image: ImageData;
};

interface Props {
	onUpdate: (replacementImageUrl: string) => void;
	setTextInput?: (replacementImageUrl: string) => void;
}

const validateGridData = (messageData: unknown): { data?: ImageAndCrop } => {
	const responseParse = gridImageResponse.safeParse(messageData);
	if (responseParse.success) {
		const cropData = responseParse.data.crop?.data;
		const imageData = responseParse.data.image?.data;
		if (cropData && imageData) {
			const payload: ImageAndCrop = {
				crop: cropData,
				image: imageData,
			};
			return { data: payload };
		}
	}
	return {};
};

export const GridImagePicker = ({ onUpdate, setTextInput }: Props) => {
	const [gridPageOpen, seGridPageOpen] = useState<'search' | 'image'>();
	const [lastImageId, setLastImageId] = useState<string>();
	const [failureFeedback, setFailureFeedBack] = useState<string>();
	const { gridUri } = useContext(ConfigContext) ?? {};

	const handleImageAndCrop = ({ crop, image }: ImageAndCrop) => {
		setLastImageId(image.id);
		const isRightAspect = isFiveFourCrop(crop);
		const assetResult = extractAsset(crop);
		const file = assetResult.success && assetResult.data.file;

		if (!isRightAspect) {
			setFailureFeedBack('Please select a 5:4 crop');
		}
		if (!file) {
			setFailureFeedBack('Could not identify file to use');
		}

		if (file && isRightAspect) {
			setTextInput?.(`${gridUri}/images/${image.id}?crop=${crop.id}`);
			onUpdate(file);
		}
	};

	const gridPageUri = gridPageOpen
		? lastImageId && gridPageOpen === 'image'
			? `${gridUri}/images/${lastImageId}?cropType=all&defaultCropType=landscape`
			: `${gridUri}/search?cropType=all&defaultCropType=landscape`
		: undefined;

	return (
		<section
			css={{
				display: 'flex',
				gap: semanticSpacing.stackSm,
				alignItems: 'center',
			}}
		>
			<Button
				variant="secondary"
				onClick={() => {
					seGridPageOpen('search');
					setFailureFeedBack(undefined);
				}}
			>
				Pick Image
			</Button>

			{lastImageId && (
				<Button
					variant="secondary"
					onClick={() => {
						seGridPageOpen('image');
						setFailureFeedBack(undefined);
					}}
				>
					change crop
				</Button>
			)}

			{failureFeedback && (
				<InlineMessage level="error">{failureFeedback}</InlineMessage>
			)}
			<PickerIframeModal
				modalTheme={{
					overlay: { position: 'fixed' },
					modal: {
						position: 'absolute',
						width: '100%',
						maxWidth: '80vw',
						maxHeight: '80vh',
					},
				}}
				theme={{
					iframe: {
						height: '1000px',
						maxHeight: '70vh',
					},
				}}
				closeAfterHandling
				href={gridPageUri}
				closeModal={() => seGridPageOpen(undefined)}
				title={'Pick an image'}
				validate={validateGridData}
				handleData={handleImageAndCrop}
			/>
		</section>
	);
};
