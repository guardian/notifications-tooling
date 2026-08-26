import { NotificationChannel } from '@config';
import {
	BrazeApiError,
	type BrazeFailureReason,
	BrazePushRecipientNotFoundError,
} from '@services';
import { determineArticleId } from '@utils';
import { z } from 'zod';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import {
	type ChannelDispatchResult,
	defaultDependencies,
	type DispatchNotificationDependencies,
	PROVIDER_REQUEST_TIMEOUT_MS,
	requireContentItem,
} from '../shared';

const brazeEnvironmentSchema = z.object({
	BRAZE_API_KEY: z.string().trim().min(1),
	BRAZE_REST_ENDPOINT: z.url(),
});

/** The outcome of a Braze test push for one requested email recipient. */
export type AppPushTestDispatchOutcome = {
	testId: string;
	recipientEmail: string;
	externalUserId: string;
	dispatchId?: string;
	status: 'success' | 'failure';
	failureReason?: BrazeFailureReason | 'unknown';
};

/**
 * Resolves test recipients by email and sends app-push content through Braze.
 * Dry-run gating lives in `dispatchNotificationTest`.
 */
export const dispatchAppPushTest = async (
	request: NotificationTestSendRequest,
	testId: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<ChannelDispatchResult<AppPushTestDispatchOutcome>> => {
	const plan = request.channels[NotificationChannel.AppPushNotification];
	if (!plan) {
		return { outcomes: [] };
	}

	const item = requireContentItem(
		request,
		plan.compose.use,
		NotificationChannel.AppPushNotification,
	);
	const [apiKey, restEndpoint] = await Promise.all([
		dependencies.getSSMParameter('BRAZE_API_KEY'),
		dependencies.getSSMParameter('BRAZE_REST_ENDPOINT'),
	]);

	const environment = brazeEnvironmentSchema.parse({
		BRAZE_API_KEY: apiKey,
		BRAZE_REST_ENDPOINT: restEndpoint,
	});
	const recipients = await Promise.all(
		plan.audience.items.map(async (recipientEmail) => {
			const normalizedEmail = recipientEmail.toLowerCase();
			const externalUserId = await dependencies.findBrazePushRecipient({
				apiKey: environment.BRAZE_API_KEY,
				restEndpoint: environment.BRAZE_REST_ENDPOINT,
				timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
				recipientEmail: normalizedEmail,
			});
			if (!externalUserId) {
				throw new BrazePushRecipientNotFoundError(normalizedEmail);
			}
			return { recipientEmail: normalizedEmail, externalUserId };
		}),
	);
	const contentApiId = determineArticleId(item.link);

	try {
		const response = await dependencies.sendBrazeTestPush({
			apiKey: environment.BRAZE_API_KEY,
			restEndpoint: environment.BRAZE_REST_ENDPOINT,
			timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
			externalUserIds: recipients.map(({ externalUserId }) => externalUserId),
			notificationId: testId,
			title: item.title,
			body: item.body,
			link: item.link,
			appleDeepLink: contentApiId ? `gnmguardian://${contentApiId}` : item.link,
			imageUrl: item.media?.thumbnailUrl ?? item.media?.imageUrl,
		});
		return {
			outcomes: recipients.map((recipient): AppPushTestDispatchOutcome => ({
				testId,
				...recipient,
				dispatchId: response.dispatch_id,
				status: 'success',
			})),
		};
	} catch (error) {
		return {
			outcomes: recipients.map((recipient): AppPushTestDispatchOutcome => ({
				testId,
				...recipient,
				status: 'failure',
				failureReason:
					error instanceof BrazeApiError ? error.reason : 'unknown',
			})),
			error,
		};
	}
};
