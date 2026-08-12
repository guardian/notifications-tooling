import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { ApiError } from '../../../api/errors';
import type {
	TestEmailResponse,
	TestEmailSendRequest,
} from '../api/send-test-email';
import { validateGuardianEmail } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import { kickerNameMap } from '../option-values';
import type { NotificationState } from '../types';

const constructRequest = (
	emailInput: string,
	notificationState: NotificationState,
): TestEmailSendRequest | undefined => {
	if (validateGuardianEmail(emailInput)) {
		return undefined;
	}

	const { parameters, content } = notificationState;
	if (parameters?.type !== 'email') {
		return undefined;
	}
	if (!content) {
		return undefined;
	}

	const {
		audienceSegments = [],
		preview = '',
		subject = '',
		kicker,
	} = parameters;
	if (audienceSegments.length === 0) {
		return;
	}

	const emailSubjectLine = kicker
		? `${kickerNameMap[kicker]}: ${subject}`
		: subject;

	return {
		channels: {
			newsletter: {
				audience: {
					type: 'email',
					items: [emailInput],
				},
				variants: audienceSegments,
				compose: {
					items: ['lead-story'],
					subject: emailSubjectLine,
				},
			},
		},
		options: {
			dryRun: false,
		},
		// TO DO - what format?
		idempotencyKey: `${emailInput}-${emailSubjectLine}-${Date.now()}`,
		content: {
			items: {
				'lead-story': {
					type: 'newsletter',
					title: subject,
					body: preview,
					link: content.webUrl,
				},
			},
		},
		sender: 'notifications-tooling-spa/v1',
	};
};

export const TestEmailForm = () => {
	const { notification, requestTestEmailSend } = useContext(
		NotificationFormContext,
	);
	const [emailInput, setEmailInput] = useState('');
	const [sendInProgress, setSendInProgress] = useState(false);
	const [confirmation, setConfirmation] = useState<TestEmailResponse>();
	const [sendError, setSendError] = useState<ApiError>();

	const inputError = validateGuardianEmail(emailInput);
	const request = constructRequest(emailInput, notification);

	const handleSend = () => {
		if (!request) {
			return;
		}

		setConfirmation(undefined);
		setSendInProgress(true);
		void requestTestEmailSend(request)
			.then((response) => {
				setConfirmation(response);
			})
			.catch((apiError) => {
				console.error(apiError);
				if (apiError instanceof ApiError) {
					setSendError(apiError);
				} else {
					setSendError(
						new ApiError({
							message: 'UNKNOWN ERROR',
							failure: 'fetch-fail',
						}),
					);
				}
			})
			.finally(() => {
				setTimeout(() => setSendInProgress(false), 1000);
			});
	};

	return (
		<section
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Test send</Typography>

			<TextInput
				description="Enter your email to send a test"
				type="email"
				placeholder="name@theguardian.com"
				aria-label="email address for test send"
				value={emailInput}
				onChange={setEmailInput}
				error={inputError}
				isInvalid={emailInput.length > 0 && !!inputError}
			/>
			<Typography element="div" variant="helpTextFormMd">
				Sends test only to the email address above, on the enabled channels -
				audience segments and timing are ignored.
			</Typography>

			<Button
				isDisabled={sendInProgress || !request || !!inputError}
				cssOverrides={css({
					alignSelf: 'flex-start',
					marginTop: semanticSpacing.stackXs,
				})}
				onPress={handleSend}
			>
				Send test notification
			</Button>

			{confirmation && (
				<InlineMessage level="success">Test email sent</InlineMessage>
			)}

			{/* TO DO - user facing error messages */}
			{sendError && (
				<InlineMessage level="error">
					Test email failed: {sendError.message}
				</InlineMessage>
			)}
		</section>
	);
};
