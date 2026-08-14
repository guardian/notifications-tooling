import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useEffect, useState } from 'react';
import { ApiError } from '../../../api/errors';
import type {
	TestEmailResponse,
	TestEmailSendRequest,
} from '../api/send-test-email';
import { validateGuardianEmail } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import { kickerNameMap } from '../option-values';
import type { AudienceSegment, NotificationState } from '../types';
import { UserContext } from '../UserContext';
import { LoadingSpinner } from './LoadingSpinner';

type TestSendParams = {
	emailInput: string;
	audienceSegments: AudienceSegment[];
	emailSubjectLine: string;
	subject: string;
	preview: string;
	webUrl: string;
};

const getSendParams = (
	emailInput: string,
	notificationState: NotificationState,
): TestSendParams | undefined => {
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
		emailInput,
		audienceSegments,
		emailSubjectLine,
		subject,
		preview,
		webUrl: content.webUrl,
	};
};

const makePayload = ({
	emailInput,
	emailSubjectLine,
	audienceSegments,
	subject,
	preview,
	webUrl,
}: TestSendParams): TestEmailSendRequest => ({
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
				link: webUrl,
			},
		},
	},
	sender: 'notifications-tooling-spa/v1',
});

export const TestEmailForm = () => {
	const { notification, requestTestEmailSend } = useContext(
		NotificationFormContext,
	);
	const { user } = useContext(UserContext) ?? {};
	const [emailInput, setEmailInput] = useState(user?.email ?? '');
	const [sendInProgress, setSendInProgress] = useState(false);
	const [confirmation, setConfirmation] = useState<TestEmailResponse>();
	const [paramsLastUsed, setParamsLastUsed] = useState<TestSendParams>();
	const [sendError, setSendError] = useState<ApiError>();

	const emailValidationIssue = validateGuardianEmail(emailInput);
	const sendParams = getSendParams(emailInput, notification);

	// remove the confirmation if the user changes anything that would
	// affect the request payload
	useEffect(() => {
		if (!confirmation || !paramsLastUsed) {
			return;
		}
		const newSendParams = getSendParams(emailInput, notification);
		if (!newSendParams) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- is ok
			return setConfirmation(undefined);
		}

		if (
			Object.entries(newSendParams).some(([key, value]) => {
				return paramsLastUsed[key as keyof TestSendParams] !== value;
			})
		) {
			return setConfirmation(undefined);
		}
	}, [confirmation, paramsLastUsed, emailInput, notification]);

	const handleSend = () => {
		if (!sendParams || validateGuardianEmail(emailInput)) {
			return;
		}

		setConfirmation(undefined);
		setSendInProgress(true);
		setParamsLastUsed(sendParams);
		void requestTestEmailSend(makePayload(sendParams))
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
				setSendInProgress(false);
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
				error={emailValidationIssue}
				isInvalid={emailInput.length > 0 && !!emailValidationIssue}
			/>
			<Typography element="div" variant="helpTextFormMd">
				Sends test only to the email address above, on the enabled channels -
				audience segments and timing are ignored.
			</Typography>

			<Button
				isDisabled={
					sendInProgress ||
					!sendParams ||
					!!emailValidationIssue ||
					!!confirmation
				}
				cssOverrides={css({
					alignSelf: 'flex-start',
					marginTop: semanticSpacing.stackXs,
				})}
				onPress={handleSend}
				icon={sendInProgress ? <LoadingSpinner /> : undefined}
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
