import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { PreviewSection } from './PreviewSection';

export const AppPreviewSection = () => {
	const {
		notification: { fetchedArticleId },
	} = useContext(NotificationFormContext);
	return (
		<PreviewSection
			title="Preview"
			description="The preview for the app alert will be shown below."
			isVisible={Boolean(fetchedArticleId)}
		>
			{/* App Preview iPhone and Android */}
		</PreviewSection>
	);
};
