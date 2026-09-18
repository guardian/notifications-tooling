import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Link } from '@guardian/stand/Link';
import { LinkButton } from '@guardian/stand/LinkButton';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { useImageUrlCheck } from '../hooks/use-image-url-check';

interface AppAlertReplaceImageSectionProps {
	replacementImageUrl: string;
	onReplacementImageUrlChange: (replacementImageUrl: string) => void;
	onUpdate: (replacementImageUrl: string) => void;
	errorMessage?: string;
}

export const AppAlertReplaceImageSection = ({
	replacementImageUrl,
	onReplacementImageUrlChange,
	onUpdate,
	errorMessage,
}: AppAlertReplaceImageSectionProps) => {
	const { gridApiUri, gridUri } = useContext(ConfigContext) ?? {};

	const {
		checkAndUpdateImage,
		handleImageUrlChange,
		imageUpdated,
		isCheckingImage,
		isUpdateDisabled,
		displayedErrorMessage,
		imageCheckRemedy,
	} = useImageUrlCheck({
		imageUrl: replacementImageUrl,
		onImageUrlChange: onReplacementImageUrlChange,
		onUpdate,
		errorMessage,
		gridUri,
		gridApiUri,
	});

	return (
		<>
			<Typography
				variant="helpTextFormMd"
				cssOverrides={css({ color: semanticColors.text.weak })}
			>
				Copy and paste a Guardian image URL to replace the existing image
			</Typography>

			<div
				css={{
					display: 'flex',
					flexDirection: 'row',
					gap: semanticSpacing.stackXs,
					alignItems: 'center',
				}}
			>
				<TextInput
					name="replacementImageUrl"
					aria-label="replacement image URL"
					isInvalid={!!displayedErrorMessage}
					size="md"
					value={replacementImageUrl}
					placeholder="Enter replacement image URL..."
					onChange={handleImageUrlChange}
					id="replacement-image-URL"
				/>
				<Button
					type="button"
					icon="refresh"
					size="md"
					variant="secondary"
					onClick={() => void checkAndUpdateImage()}
					isDisabled={isUpdateDisabled}
				>
					{isCheckingImage ? 'Checking...' : 'Update'}
				</Button>
			</div>

			{displayedErrorMessage && (
				<InlineMessage level="error">{displayedErrorMessage}</InlineMessage>
			)}

			{imageCheckRemedy === 'authenticate' && gridUri && (
				<LinkButton
					icon="open_in_new"
					target="_blank"
					rel="noopener noreferrer"
					size="sm"
					variant="secondary"
					href={gridUri}
				>
					Open Grid to refresh credentials
				</LinkButton>
			)}

			{imageCheckRemedy === 'contact-cp' && (
				<Typography>
					Please contact{' '}
					<Link href='mailto:central.production@theguardian.com"'>
						Central Production
					</Link>{' '}
					if the problem persists
				</Typography>
			)}

			{imageUpdated && replacementImageUrl && (
				<InlineMessage level="success">Image updated</InlineMessage>
			)}
		</>
	);
};
