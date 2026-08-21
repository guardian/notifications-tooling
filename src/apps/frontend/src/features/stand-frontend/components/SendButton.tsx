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
import {
	buildAppAlertRequest,
	buildNewsletterRequest,
} from '../build-request-payloads';
import {
	appAlertFormSchema,
	type AppAlertFormValues,
	newsletterFormSchema,
	type NewsletterFormValues,
} from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';

interface SendButtonProps {
	children: React.ReactNode;
}

export const SendButton = ({ children }: SendButtonProps) => {
	const { channel, notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const {
		formState: { errors },
		handleSubmit,
		setError,
	} = useFormContext<NewsletterFormValues | AppAlertFormValues>();
	const prepareSend = (values: NewsletterFormValues | AppAlertFormValues) => {
		if (!notification.content) {
			setError('root.article', {
				message: 'Paste a URL to fetch an article',
			});
			return;
		}

		const idempotencyKey = crypto.randomUUID();
		const request =
			channel === 'email'
				? buildNewsletterRequest({
						values: newsletterFormSchema.parse(values),
						content: notification.content,
						idempotencyKey,
					})
				: buildAppAlertRequest({
						values: appAlertFormSchema.parse(values),
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
