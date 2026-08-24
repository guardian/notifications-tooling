import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import type { ResolvedArticle } from '@models';
import { useContext, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { ApiError } from '../../../api/errors';
import type {
	TestEmailResponse,
	TestEmailSendRequest,
} from '../api/send-test-email';
import { ConfigContext } from '../ConfigContext';
import { validateGuardianEmail } from '../form-validation';
import { composeNewsletterSubject } from '../newsletter-subject';
import type { NewsletterFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import type { AudienceSegment } from '../types';
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
	parameters: Partial<NewsletterFormValues>,
	content?: ResolvedArticle,
): TestSendParams | undefined => {
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

	const emailSubjectLine = composeNewsletterSubject(subject, kicker);

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
	idempotencyKey: crypto.randomUUID(),
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
	const parameters = useWatch<NewsletterFormValues>();
	const { user } = useContext(ConfigContext) ?? {};
	const [emailInput, setEmailInput] = useState(user?.email ?? '');
	const [sendInProgress, setSendInProgress] = useState(false);
	const [confirmation, setConfirmation] = useState<TestEmailResponse>();
	const [paramsLastUsed, setParamsLastUsed] = useState<TestSendParams>();
	const [sendError, setSendError] = useState<ApiError>();

	const emailValidationIssue = validateGuardianEmail(emailInput);
	const sendParams = getSendParams(
		emailInput,
		parameters,
		notification.content,
	);

	// remove the confirmation if the user changes anything that would
	// affect the request payload
	useEffect(() => {
		if (!confirmation || !paramsLastUsed) {
			return;
		}
		const newSendParams = getSendParams(
			emailInput,
			parameters,
			notification.content,
		);
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
	}, [
		confirmation,
		paramsLastUsed,
		emailInput,
		notification.content,
		parameters,
	]);

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
			<Typography variant="bodyBoldMd">Send a test</Typography>

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
				Tests send only to the email address above — audience segments and
				timing are ignored.
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
				variant="secondary"
				size="md"
				icon={sendInProgress ? <LoadingSpinner /> : undefined}
			>
				Send test
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
