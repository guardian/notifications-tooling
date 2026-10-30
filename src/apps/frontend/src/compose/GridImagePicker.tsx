import { semanticSpacing } from '@guardian/stand';
import { GridImagePicker } from '@guardian/stand/GridImagePicker';
import { useContext } from 'react';
import { ConfigContext } from '../config/ConfigContext';

interface Props {
	onUpdate: (replacementImageUrl: string) => void;
	setTextInput?: (replacementImageUrl: string) => void;
}

export const GridImagePickerImp = ({ onUpdate, setTextInput }: Props) => {
	const { gridUri } = useContext(ConfigContext) ?? {};

	return (
		<section
			css={{
				display: 'flex',
				gap: semanticSpacing.stackSm,
				alignItems: 'center',
			}}
		>
			{gridUri && (
				<GridImagePicker
					handleCropData={({ imageAssetUrl }) => {
						onUpdate(imageAssetUrl);
						setTextInput?.(imageAssetUrl);
					}}
					gridUri={gridUri}
					allowedAspectRatios={['5:4']}
					theme={{
						container: {
							width: '100%',
						},
						imagePreview: {
							maxHeight: '200px',
							maxWidth: '300px',
						},
					}}
				/>
			)}
		</section>
	);
};
