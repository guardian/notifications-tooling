import { newsletterSegments, NotificationChannel } from '@config';
import { determineBlockId } from '@utils';
import { z } from 'zod';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import type { NewsletterDispatchOutcome } from '../dispatch-outcome';
import {
	type ChannelDispatchResult,
	defaultDependencies,
	type DispatchNotificationDependencies,
	firstSettledError,
	PROVIDER_REQUEST_TIMEOUT_MS,
	requireContentItem,
} from '../shared';
import {
	mapNewsletterOutcomes,
	newsletterEnvironmentSchema,
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

const campaignLinkTrackingTokenWithSeparator =
	/(?:\?|&(?:amp;)?)##braze_utm##/g;

// Direct /messages/send calls do not expand campaign placeholders; removing the
// separator as well keeps a following URL fragment valid.
const formatHtmlForBrazeTestSend = (html: string): string =>
	html.replace(campaignLinkTrackingTokenWithSeparator, '');

/**
 * Sends one Braze test email per rendering variant to the registered test
 * recipients. `resolved.emailRenderingId` is the actual email-rendering id used
 * to render the variant, so persisted rows record what was really dispatched.
 */
export const dispatchNewsletterTest = async (
	request: NotificationTestSendRequest,
	_testId: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<ChannelDispatchResult<NewsletterDispatchOutcome>> => {
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
		brazeClient,
		emailRenderingEndpoint,
		brazeAppId,
		brazeTestEmailFrom,
		brazeTestEmailReplyTo,
	] = await Promise.all([
		dependencies.loadBrazeClient(),
		dependencies.getSSMParameter('EMAIL_RENDERING_ENDPOINT'),
		dependencies.getSSMParameter('BRAZE_APP_ID'),
		dependencies.getSSMParameter('BRAZE_TEST_EMAIL_FROM'),
		dependencies.getSSMParameter('BRAZE_TEST_EMAIL_REPLY_TO'),
	]);

	const environment = newsletterEnvironmentSchema.parse({
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
	const blockId = determineBlockId(item.link);

	// All variants must render before any Braze call; a render failure aborts.
	const renderedVariants: Array<{
		segmentId: string;
		emailRenderingId: string;
		html: string;
	}> = [];
	for (const segmentId of plan.variants) {
		const emailRenderingId =
			newsletterSegments[segmentId].emailRenderingNewsletterId;
		const html = await dependencies.renderEmail({
			endpoint: environment.EMAIL_RENDERING_ENDPOINT,
			articleUrl: item.link,
			...(blockId ? { blockId } : {}),
			newsletterId: emailRenderingId,
			headlineOverride: item.title,
			previewText: item.body,
			hideKicker: true,
			timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
		});
		renderedVariants.push({
			segmentId,
			emailRenderingId,
			html: formatHtmlForBrazeTestSend(html),
		});
	}

	await brazeClient.registerTestEmailRecipients({
		recipientEmails,
		timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
	});

	// allSettled so one variant's send failure does not abort the others.
	const settled = await Promise.allSettled(
		renderedVariants.map(async ({ html }) => {
			const result = await brazeClient.sendTestEmail({
				appId: configuration.BRAZE_APP_ID,
				from: configuration.BRAZE_TEST_EMAIL_FROM,
				replyTo: configuration.BRAZE_TEST_EMAIL_REPLY_TO,
				recipientEmails,
				html,
				subject: plan.compose.subject,
				timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
			});
			return { providerRef: result.dispatch_id, status: result.status };
		}),
	);

	const outcomes = mapNewsletterOutcomes(
		settled,
		renderedVariants.map(({ segmentId, emailRenderingId }) => ({
			requested: { channel: 'newsletter', segment: segmentId },
			resolved: {
				channel: 'newsletter',
				emailRenderingId,
				...(blockId ? { blockId } : {}),
			},
		})),
	);

	return { outcomes, error: firstSettledError(settled) };
};
