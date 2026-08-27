import { newsletterSegments, NotificationChannel } from '@config';
import type {
	BrazeFailureReason,
	EmailRenderingFailureReason,
} from '@services';
import { z } from 'zod';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import {
	type ChannelDispatchResult,
	defaultDependencies,
	type DispatchNotificationDependencies,
	firstSettledError,
	PROVIDER_REQUEST_TIMEOUT_MS,
	requireContentItem,
} from '../shared';
import {
	newsletterEnvironmentSchema,
	newsletterFailureReason,
	newsletterStatusCode,
} from './dispatch-newsletter';

const testEmailEnvironmentSchema = z.object({
	BRAZE_APP_ID: z.string().trim().min(1),
	BRAZE_TEST_EMAIL_FROM: z.preprocess(
		(value) => (typeof value === 'string' && !value.trim() ? undefined : value),
		z
			.string()
			.trim()
			.min(1)
			.default('dev testing <dev-testing@email.theguardian.com>'),
	),
	BRAZE_TEST_EMAIL_REPLY_TO: z.preprocess(
		(value) => (typeof value === 'string' && !value.trim() ? undefined : value),
		z.union([z.email(), z.literal('NO_REPLY_TO')]).default('NO_REPLY_TO'),
	),
});

/**
 * The outcome of one test-email send (one per rendering variant). `dispatchId`
 * is Braze's `dispatch_id` from the test send, kept for tracking.
 */
export type NewsletterTestDispatchOutcome = {
	testId: string;
	variant: string;
	dispatchId?: string;
	status: 'success' | 'failure';
	failureReason?: BrazeFailureReason | EmailRenderingFailureReason | 'unknown';
	/** The Braze or email-rendering HTTP status once the send reached the provider. */
	providerStatusCode?: number;
};

export const dispatchNewsletterTest = async (
	request: NotificationTestSendRequest,
	testId: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<ChannelDispatchResult<NewsletterTestDispatchOutcome>> => {
	const plan = request.channels[NotificationChannel.Newsletter];
	if (!plan) {
		return { outcomes: [] };
	}
	if (plan.compose.items.length !== 1) {
		throw new Error('Only one newsletter item can be rendered currently.');
	}

	const item = requireContentItem(
		request,
		plan.compose.items[0]!,
		NotificationChannel.Newsletter,
	);
	const [
		brazeApiKey,
		brazeRestEndpoint,
		emailRenderingEndpoint,
		brazeAppId,
		brazeTestEmailFrom,
		brazeTestEmailReplyTo,
	] = await Promise.all([
		dependencies.getSSMParameter('BRAZE_API_KEY'),
		dependencies.getSSMParameter('BRAZE_REST_ENDPOINT'),
		dependencies.getSSMParameter('EMAIL_RENDERING_ENDPOINT'),
		dependencies.getSSMParameter('BRAZE_APP_ID'),
		dependencies.getSSMParameter('BRAZE_TEST_EMAIL_FROM'),
		dependencies.getSSMParameter('BRAZE_TEST_EMAIL_REPLY_TO'),
	]);

	const environment = newsletterEnvironmentSchema.parse({
		BRAZE_API_KEY: brazeApiKey,
		BRAZE_REST_ENDPOINT: brazeRestEndpoint,
		EMAIL_RENDERING_ENDPOINT: emailRenderingEndpoint,
	});
	const configuration = testEmailEnvironmentSchema.parse({
		BRAZE_APP_ID: brazeAppId,
		BRAZE_TEST_EMAIL_FROM: brazeTestEmailFrom,
		BRAZE_TEST_EMAIL_REPLY_TO: brazeTestEmailReplyTo,
	});
	const recipientEmails = plan.audience.items.map((email) =>
		email.toLowerCase(),
	);

	// All variants must render before any Braze call; a render failure aborts.
	const renderedVariants: Array<{ segmentId: string; html: string }> = [];
	for (const segmentId of plan.variants) {
		renderedVariants.push({
			segmentId,
			html: await dependencies.renderEmail({
				endpoint: environment.EMAIL_RENDERING_ENDPOINT,
				articleUrl: item.link,
				newsletterId: newsletterSegments[segmentId].emailRenderingNewsletterId,
				headlineOverride: item.title,
				previewText: item.body,
				timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
			}),
		});
	}

	await dependencies.registerBrazeTestEmailRecipients({
		apiKey: environment.BRAZE_API_KEY,
		restEndpoint: environment.BRAZE_REST_ENDPOINT,
		recipientEmails,
		timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
	});

	// allSettled so one variant's send failure does not abort the others.
	const settled = await Promise.allSettled(
		renderedVariants.map(({ html }) =>
			dependencies.sendBrazeTestEmail({
				apiKey: environment.BRAZE_API_KEY,
				restEndpoint: environment.BRAZE_REST_ENDPOINT,
				appId: configuration.BRAZE_APP_ID,
				from: configuration.BRAZE_TEST_EMAIL_FROM,
				replyTo: configuration.BRAZE_TEST_EMAIL_REPLY_TO,
				recipientEmails,
				html,
				subject: plan.compose.subject,
				timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
			}),
		),
	);

	const outcomes = settled.map(
		(result, index): NewsletterTestDispatchOutcome => {
			const { segmentId } = renderedVariants[index]!;
			if (result.status === 'fulfilled') {
				return {
					testId,
					variant: segmentId,
					dispatchId: result.value.dispatch_id,
					status: 'success',
					providerStatusCode: result.value.status,
				};
			}
			return {
				testId,
				variant: segmentId,
				status: 'failure',
				failureReason: newsletterFailureReason(result.reason),
				providerStatusCode: newsletterStatusCode(result.reason),
			};
		},
	);

	return { outcomes, error: firstSettledError(settled) };
};
