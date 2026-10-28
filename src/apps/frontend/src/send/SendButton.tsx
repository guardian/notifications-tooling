import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { NotificationFormContext } from '../compose/NotificationFormContext';

interface SendButtonProps {
	children: React.ReactNode;
	onPress: () => void;
}

export const SendButton = ({ children, onPress }: SendButtonProps) => {
	const { composerState } = useContext(NotificationFormContext);
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
			<Button
				type="button"
				variant="primary"
				isDisabled={composerState.isFetchingArticle}
				onPress={onPress}
			>
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
