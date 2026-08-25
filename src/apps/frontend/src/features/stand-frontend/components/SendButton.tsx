import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { useFormContext } from 'react-hook-form';

interface SendButtonProps {
	children: React.ReactNode;
}

export const SendButton = ({ children }: SendButtonProps) => {
	const {
		formState: { errors },
	} = useFormContext();

	return (
		<div
			css={{
				maxWidth: semanticSizing.input.maxWidthPx,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				gap: semanticSpacing.stackXxs,
			}}
		>
			<Typography variant="labelFormMd">Send</Typography>
			<Typography
				variant="helpTextFormMd"
				cssOverrides={css({ color: semanticColors.text.weak })}
			>
				Before sending, review in the preview on the right
			</Typography>
			<Button type="submit" variant="primary">
				{children}
			</Button>
			{errors.root?.request && (
				<InlineMessage level="error">
					{errors.root.request.message}
				</InlineMessage>
			)}
		</div>
	);
};
