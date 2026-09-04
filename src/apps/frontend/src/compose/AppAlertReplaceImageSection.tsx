import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';

interface AppAlertReplaceImageSectionProps {
	onUpdate: (replacementImageUrl: string) => void;
}

export const AppAlertReplaceImageSection = ({
	onUpdate,
}: AppAlertReplaceImageSectionProps) => {
	const [replacementImageUrl, setReplacementImageUrl] = useState('');
	const [imageUpdated, setImageUpdated] = useState(false);

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
					size="md"
					value={replacementImageUrl}
					placeholder="Enter replacement image URL..."
					onChange={(url) => {
						setReplacementImageUrl(url);
						setImageUpdated(false);
					}}
					id="replacement-image-URL"
				/>
				<Button
					type="button"
					icon="refresh"
					size="md"
					variant="secondary"
					onClick={() => {
						onUpdate(replacementImageUrl);
						setImageUpdated(true);
					}}
				>
					Update
				</Button>
			</div>
			{imageUpdated && (
				<InlineMessage level="success">Image updated</InlineMessage>
			)}
		</>
	);
};
