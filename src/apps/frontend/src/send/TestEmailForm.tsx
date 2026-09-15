import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterSegmentId, ResolvedArticle } from '@models';
import { useContext, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import type { ApiError } from '../api-client/errors';
import { NotificationFormContext } from '../compose/NotificationFormContext';
import { ConfigContext } from '../config/ConfigContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { senderId } from '../utils/build-request-payloads';
import { validateGuardianEmail } from '../utils/form-validation';
import { composeNewsletterEmailSubjectLine } from '../utils/newsletter-email-subject';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import type {
	TestEmailResponse,
	TestEmailSendRequest,
} from '../utils/send-test-email';

type TestSendParams = {
	emailInput: string;
	audienceSegments: NewsletterSegmentId[];
	subjectLine: string;
	subjectText: string;
	previewText: string;
	includePreviewText: boolean;
	webUrl: string;
};

const getSendParams = (
	emailInput: string,
	formValues: Partial<NewsletterEmailFormValues>,
	article?: ResolvedArticle,
	requestedUrl?: string,
): TestSendParams | undefined => {
	if (!article) {
		return undefined;
	}

	const {
		audienceSegments = [],
		previewText = '',
		includePreviewText = true,
		subjectText = '',
		kicker,
	} = formValues;
	if (audienceSegments.length === 0) {
		return;
	}

	const subjectLine = composeNewsletterEmailSubjectLine(subjectText, kicker);

	return {
		emailInput,
		audienceSegments,
		subjectLine,
		subjectText,
		previewText,
		includePreviewText,
		webUrl: requestedUrl ?? article.webUrl,
	};
};

const makePayload = ({
	emailInput,
	subjectLine,
	audienceSegments,
	subjectText,
	previewText,
	includePreviewText,
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
				subject: subjectLine,
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
				title: subjectText,
				body: includePreviewText ? previewText : '',
				link: webUrl,
			},
		},
	},
	sender: senderId,
});

export const TestEmailForm = () => {
	const { composerState, requestTestEmailSend } = useContext(
		NotificationFormContext,
	);
	const formValues = useWatch<NewsletterEmailFormValues>();
	const { user } = useContext(ConfigContext) ?? {};
	const [emailInput, setEmailInput] = useState(user?.email ?? '');
	const [sendInProgress, setSendInProgress] = useState(false);
	const [testSendResponse, setTestSendResponse] = useState<TestEmailResponse>();
	const [paramsLastUsed, setParamsLastUsed] = useState<TestSendParams>();
	const [sendError, setSendError] = useState<ApiError>();

	const emailValidationIssue = validateGuardianEmail(emailInput);
	const sendParams = getSendParams(
		emailInput,
		formValues,
		composerState.article,
		composerState.requestedUrl,
	);

	// remove the response if the user changes anything that would
	// affect the request payload
	useEffect(() => {
		if (!testSendResponse || !paramsLastUsed) {
			return;
		}
		const newSendParams = getSendParams(
			emailInput,
			formValues,
			composerState.article,
			composerState.requestedUrl,
		);
		if (!newSendParams) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- is ok
			return setTestSendResponse(undefined);
		}

		if (
			Object.entries(newSendParams).some(([key, value]) => {
				return paramsLastUsed[key as keyof TestSendParams] !== value;
			})
		) {
			return setTestSendResponse(undefined);
		}
	}, [
		testSendResponse,
		paramsLastUsed,
		emailInput,
		composerState.article,
		composerState.requestedUrl,
		formValues,
	]);

	const handleSend = () => {
		if (!sendParams || validateGuardianEmail(emailInput)) {
			return;
		}

		setTestSendResponse(undefined);
		setSendError(undefined);
		setSendInProgress(true);
		setParamsLastUsed(sendParams);
		void requestTestEmailSend(makePayload(sendParams))
			.then((result) => {
				if (!result.success) {
					console.error(result.failure);
					return setSendError(result.failure);
				}
				setTestSendResponse(result.data);
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
					!!testSendResponse
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

			{testSendResponse && (
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
