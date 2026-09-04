import { newsletterSegments, NotificationChannel } from '@config';
import {
	BrazeApiError,
	type BrazeFailureReason,
	EmailRenderingError,
	type EmailRenderingFailureReason,
} from '@services';
import { z } from 'zod';
import type { NotificationSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import {
	type ChannelDispatchResult,
	type DispatchNotificationDependencies,
	firstSettledError,
	PROVIDER_REQUEST_TIMEOUT_MS,
	requireContentItem,
} from '../shared';

export const newsletterEnvironmentSchema = z.object({
	EMAIL_RENDERING_ENDPOINT: z.url(),
});

/**
 * The outcome of one newsletter send (one per targeted segment). `dispatchId` is
 * Braze's `dispatch_id` from the campaign-trigger response, kept for tracking.
 */
export type NewsletterDispatchOutcome = {
	notificationId: string;
	segmentId: string;
	campaignId: string;
	dispatchId?: string;
	status: 'success' | 'failure';
	failureReason?: BrazeFailureReason | EmailRenderingFailureReason | 'unknown';
	/** The Braze or email-rendering HTTP status when a failed send reached the provider. */
	providerStatusCode?: number;
};

export const newsletterFailureReason = (
	error: unknown,
): BrazeFailureReason | EmailRenderingFailureReason | 'unknown' =>
	error instanceof BrazeApiError || error instanceof EmailRenderingError
		? error.reason
		: 'unknown';

export const newsletterStatusCode = (error: unknown): number | undefined =>
	error instanceof BrazeApiError || error instanceof EmailRenderingError
		? error.status
		: undefined;

export const resolveNewsletterDispatch = (request: NotificationSendRequest) => {
	const plan = request.channels[NotificationChannel.Newsletter];

	if (!plan) {
		return;
	}
	if (plan.compose.items.length !== 1) {
		throw new Error('Only one newsletter item can be rendered currently.');
	}

	const item = requireContentItem(
		request,
		plan.compose.items[0]!,
		NotificationChannel.Newsletter,
	);

	const segments = plan.audience.items.map((segmentId) => {
		const { brazeCampaignId, emailRenderingNewsletterId } =
			newsletterSegments[segmentId];
		if (!brazeCampaignId.trim()) {
			throw new Error(
				`No Braze campaign ID is configured for newsletter segment '${segmentId}'.`,
			);
		}
		if (!emailRenderingNewsletterId.trim()) {
			throw new Error(
				`No email-rendering newsletter ID is configured for newsletter segment '${segmentId}'.`,
			);
		}

		return { segmentId, brazeCampaignId, emailRenderingNewsletterId };
	});

	return { item, plan, segments };
};

export const dispatchNewsletter = async (
	resolvedDispatch: ReturnType<typeof resolveNewsletterDispatch>,
	notificationId: string,
	dependencies: DispatchNotificationDependencies,
): Promise<ChannelDispatchResult<NewsletterDispatchOutcome>> => {
	if (!resolvedDispatch) {
		return { outcomes: [] };
	}

	const { item, plan, segments } = resolvedDispatch;

	const [brazeClient, emailRenderingEndpoint] = await Promise.all([
		dependencies.loadBrazeClient(),
		dependencies.getSSMParameter('EMAIL_RENDERING_ENDPOINT'),
	]);

	const environment = newsletterEnvironmentSchema.parse({
		EMAIL_RENDERING_ENDPOINT: emailRenderingEndpoint,
	});

	// allSettled so one segment's render/send failure does not abort the others.
	const settled = await Promise.allSettled(
		segments.map(async ({ emailRenderingNewsletterId, brazeCampaignId }) => {
			const html = await dependencies.renderEmail({
				endpoint: environment.EMAIL_RENDERING_ENDPOINT,
				articleUrl: item.link,
				newsletterId: emailRenderingNewsletterId,
				headlineOverride: item.title,
				previewText: item.body,
				timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
			});

			// Braze returns one dispatch_id per send; kept for tracking.
			const { dispatch_id: dispatchId, status } =
				await brazeClient.sendCampaign({
					campaignId: brazeCampaignId,
					html,
					subject: plan.compose.subject,
					timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
				});

			return { dispatchId, status };
		}),
	);

	const outcomes = settled.map((result, index): NewsletterDispatchOutcome => {
		const { segmentId, brazeCampaignId } = segments[index]!;
		if (result.status === 'fulfilled') {
			return {
				notificationId,
				segmentId,
				campaignId: brazeCampaignId,
				dispatchId: result.value.dispatchId,
				status: 'success',
				providerStatusCode: result.value.status,
			};
		}
		return {
			notificationId,
			segmentId,
			campaignId: brazeCampaignId,
			status: 'failure',
			failureReason: newsletterFailureReason(result.reason),
			providerStatusCode: newsletterStatusCode(result.reason),
		};
	});

	return { outcomes, error: firstSettledError(settled) };
};
