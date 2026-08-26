import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';
import type { ApiError } from '../../../api/errors';
import type { TestAppPushSendRequest } from '../api/send-test-app-push';
import { ConfigContext } from '../ConfigContext';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { LoadingSpinner } from './LoadingSpinner';

const emailSchema = z.email();

export const TestAppPushForm = ({
	title,
	thumbnailUrl,
}: {
	title: string;
	thumbnailUrl?: string;
}) => {
	const { notification, requestTestAppPushSend } = useContext(
		NotificationFormContext,
	);
	const { user } = useContext(ConfigContext) ?? {};
	const headline = useWatch<AppAlertFormValues, 'headline'>({
		name: 'headline',
	});
	const [emailInput, setEmailInput] = useState(user?.email ?? '');
	const [sendInProgress, setSendInProgress] = useState(false);
	const [sent, setSent] = useState(false);
	const [sendError, setSendError] = useState<ApiError>();
	const emailValidationIssue = emailSchema.safeParse(emailInput).success
		? undefined
		: 'not a valid email';
	const webUrl = notification.content?.webUrl;
	const canSend = Boolean(title && headline && webUrl && !emailValidationIssue);

	const handleSend = () => {
		if (!canSend || !webUrl) {
			return;
		}

		const request: TestAppPushSendRequest = {
			channels: {
				'app-push': {
					audience: { type: 'email', items: [emailInput] },
					compose: { use: 'lead-story' },
				},
			},
			options: { dryRun: false },
			idempotencyKey: crypto.randomUUID(),
			content: {
				items: {
					'lead-story': {
						type: 'app-push',
						title,
						body: headline,
						link: webUrl,
						...(thumbnailUrl
							? {
									media: {
										type: 'image' as const,
										imageUrl: thumbnailUrl,
										thumbnailUrl,
									},
								}
							: {}),
					},
				},
			},
			sender: 'notifications-tooling-spa/v1',
		};

		setSent(false);
		setSendError(undefined);
		setSendInProgress(true);
		void requestTestAppPushSend(request)
			.then((result) => {
				if (!result.success) {
					return setSendError(result.failure);
				}
				setSent(true);
			})
			.finally(() => setSendInProgress(false));
	};

	return (
		<section
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Send a test notification</Typography>
			<TextInput
				description="Enter the email associated with your Braze app profile"
				type="email"
				placeholder="name@example.com"
				aria-label="email address for app-push test send"
				value={emailInput}
				onChange={(email) => {
					setEmailInput(email);
					setSent(false);
				}}
				error={emailValidationIssue}
				isInvalid={emailInput.length > 0 && !!emailValidationIssue}
			/>
			<Button
				isDisabled={sendInProgress || !canSend || sent}
				cssOverrides={css({ alignSelf: 'flex-start' })}
				onPress={handleSend}
				variant="secondary"
				size="md"
				icon={sendInProgress ? <LoadingSpinner /> : undefined}
			>
				Send test notification
			</Button>
			{sent && (
				<InlineMessage level="success">Test notification sent</InlineMessage>
			)}
			{sendError && (
				<InlineMessage level="error">
					Test notification failed: {sendError.message}
				</InlineMessage>
			)}
		</section>
	);
};
