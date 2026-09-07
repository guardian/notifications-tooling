import { css } from '@emotion/react';
import { baseSizing, semanticColors, semanticSpacing } from '@guardian/stand';
import { TextArea } from '@guardian/stand/TextArea';
import { Typography } from '@guardian/stand/Typography';
import { Controller, useFormContext } from 'react-hook-form';
import { NEWSLETTER_LIMIT_FALLBACKS } from '../hooks/useChannelConstraints';
import type { ChannelConstraintsResponse } from '../schemas';
import { type NewsletterFormValues } from '../utils/notification-forms';
import { CharacterCount } from './CharacterCount';
import { PreviewTextToggle } from './PreviewTextToggle';

interface PreviewTextFormFieldProps {
	constraints?: ChannelConstraintsResponse;
	showPreview: boolean;
	onTogglePreview: (showPreview: boolean) => void;
}

const styles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXs,
	}),
	description: css({ color: semanticColors.text.weak }),
};

export const PreviewTextFormField = ({
	constraints,
	showPreview,
	onTogglePreview,
}: PreviewTextFormFieldProps) => {
	const { clearErrors, control } = useFormContext<NewsletterFormValues>();
	const previewLimits =
		constraints?.channels.newsletter.content.body ??
		NEWSLETTER_LIMIT_FALLBACKS.body;

	return (
		<Controller
			control={control}
			name="preview"
			render={({ field, fieldState }) => (
				<div css={styles.container}>
					<Typography variant="labelFormMd">Preview text</Typography>
					<Typography variant="helpTextFormMd" css={styles.description}>
						Choose the preview text for the email newsletter
					</Typography>
					<PreviewTextToggle
						isSelected={showPreview}
						onChange={(isSelected) => {
							onTogglePreview(isSelected);
							if (!isSelected) {
								clearErrors('preview');
							}
						}}
					/>
					{showPreview && (
						<div>
							<TextArea
								name={field.name}
								aria-label="Preview text"
								placeholder="Enter preview text here..."
								value={field.value}
								isInvalid={!!fieldState.error?.message}
								error={fieldState.error?.message}
								theme={{
									shared: {
										height: `calc(${baseSizing.size16Rem} * 7)`,
									},
								}}
								cssOverrides={css({
									textarea: {
										resize: 'vertical',
									},
								})}
								onChange={(value) => {
									field.onChange(value.replaceAll('\n', ''));
								}}
							/>
							<CharacterCount
								count={field.value.length}
								softLimit={previewLimits.recommended}
								fieldDescription="Preview text"
							/>
						</div>
					)}
				</div>
			)}
		/>
	);
};
