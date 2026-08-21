import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import type { ResolvedArticle } from '@models';
import { useContext } from 'react';
import { type FieldValues, useFormContext } from 'react-hook-form';
import type { SendNotificationRequest } from '../api/schemas';
import { NotificationFormContext } from '../NotificationContext';

interface SendButtonProps<FormValues extends FieldValues> {
	children: React.ReactNode;
	buildRequest: (args: {
		values: FormValues;
		content: ResolvedArticle;
		idempotencyKey: string;
	}) => SendNotificationRequest;
}

export const SendButton = <FormValues extends FieldValues>({
	children,
	buildRequest,
}: SendButtonProps<FormValues>) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const {
		formState: { errors },
		handleSubmit,
		setError,
	} = useFormContext<FormValues>();

	const prepareSend = (values: FormValues) => {
		if (!notification.content) {
			setError('root.article', {
				message: 'Paste a URL to fetch an article',
			});
			return;
		}

		const idempotencyKey = crypto.randomUUID();
		const request = buildRequest({
			values,
			content: notification.content,
			idempotencyKey,
		});

		updateNotification({ type: 'prepare-send', request });
	};

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
				onClick={() => {
					if (!notification.content) {
						setError('root.article', {
							message: 'Paste a URL to fetch an article',
						});
					}
					void handleSubmit(prepareSend)();
				}}
				variant="primary"
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
