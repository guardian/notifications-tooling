import {
	appPushNotificationSegments,
	newsletterSegments,
	NotificationChannel,
} from '@config';
import { z } from 'zod';
import type { NotificationSendRequest } from '../routers/notifications/schemas/notification-send-request';
import { sendAppNotification } from './app-notification/client';
import { sendBrazeCampaign } from './email/braze/client';
import { renderEmail } from './email/rendering/client';

const newsletterEnvironmentSchema = z.object({
	BRAZE_API_KEY: z.string().trim().min(1),
	BRAZE_REST_ENDPOINT: z.url(),
	EMAIL_RENDERING_ENDPOINT: z.url(),
	PROVIDER_REQUEST_TIMEOUT_MS: z.coerce
		.number()
		.int()
		.positive()
		.default(10_000),
});

export type DispatchNotificationDependencies = {
	environment: NodeJS.ProcessEnv;
	renderEmail: typeof renderEmail;
	sendAppNotification: typeof sendAppNotification;
	sendBrazeCampaign: typeof sendBrazeCampaign;
};

const defaultDependencies: DispatchNotificationDependencies = {
	environment: process.env,
	renderEmail,
	sendAppNotification,
	sendBrazeCampaign,
};

const requireContentItem = (
	request: NotificationSendRequest,
	itemId: string,
	channel: NotificationChannel,
) => {
	const item = request.content.items[itemId];

	if (item?.type !== channel) {
		throw new Error(
			`Content item '${itemId}' is not valid for the '${channel}' channel.`,
		);
	}

	return item;
};

const resolveNewsletterDispatch = (
	request: NotificationSendRequest,
	dependencies: DispatchNotificationDependencies,
) => {
	const plan = request.channels[NotificationChannel.Newsletter];

	if (!plan) {
		return;
	}
	if (plan.audience.type !== 'segment') {
		throw new Error('Sending test emails is not implemented.');
	}
	if (plan.compose.items.length !== 1) {
		throw new Error('Only one newsletter item can be rendered currently.');
	}

	const item = requireContentItem(
		request,
		plan.compose.items[0]!,
		NotificationChannel.Newsletter,
	);
	const environment = newsletterEnvironmentSchema.parse(
		dependencies.environment,
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

		return { brazeCampaignId, emailRenderingNewsletterId };
	});

	return { environment, item, plan, segments };
};

const dispatchNewsletter = async (
	resolvedDispatch: ReturnType<typeof resolveNewsletterDispatch>,
	dependencies: DispatchNotificationDependencies,
): Promise<void> => {
	if (!resolvedDispatch) {
		return;
	}

	const { environment, item, plan, segments } = resolvedDispatch;
	for (const { brazeCampaignId, emailRenderingNewsletterId } of segments) {
		// Email-rendering currently derives content from the article URL. Title,
		// body, and media overrides remain unused until its POST contract exists.
		const html = await dependencies.renderEmail({
			endpoint: environment.EMAIL_RENDERING_ENDPOINT,
			articleUrl: item.link,
			newsletterId: emailRenderingNewsletterId,
			timeoutMs: environment.PROVIDER_REQUEST_TIMEOUT_MS,
		});

		await dependencies.sendBrazeCampaign({
			apiKey: environment.BRAZE_API_KEY,
			restEndpoint: environment.BRAZE_REST_ENDPOINT,
			campaignId: brazeCampaignId,
			html,
			subject: plan.compose.subject,
			timeoutMs: environment.PROVIDER_REQUEST_TIMEOUT_MS,
		});
	}
};

const resolveAppPushDispatch = (request: NotificationSendRequest) => {
	const plan = request.channels[NotificationChannel.AppPushNotification];
	if (!plan) {
		return;
	}

	const item = requireContentItem(
		request,
		plan.compose.use,
		NotificationChannel.AppPushNotification,
	);

	return {
		item,
		topics: plan.audience.items.map(
			(segmentId) => appPushNotificationSegments[segmentId].mobileN10nTopic,
		),
	};
};

const dispatchAppPush = async (
	resolvedDispatch: ReturnType<typeof resolveAppPushDispatch>,
	dependencies: DispatchNotificationDependencies,
): Promise<void> => {
	if (!resolvedDispatch) {
		return;
	}

	const { item, topics } = resolvedDispatch;
	await dependencies.sendAppNotification({
		topics,
		title: item.title,
		body: item.body,
		link: item.link,
		media: item.media,
	});
};

export const dispatchNotification = async (
	request: NotificationSendRequest,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<void> => {
	if (request.options.dryRun) {
		return;
	}

	if (request.options.scheduledFor) {
		throw new Error('Scheduled delivery is not implemented.');
	}

	const newsletterDispatch = resolveNewsletterDispatch(request, dependencies);
	const appPushDispatch = resolveAppPushDispatch(request);

	// Delivery outcomes are not persisted yet. Retrying after a partial failure
	// can resend targets that already succeeded, so failures must not be retried
	// automatically until partial-delivery recovery is implemented.
	await Promise.all([
		dispatchNewsletter(newsletterDispatch, dependencies),
		dispatchAppPush(appPushDispatch, dependencies),
	]);
};
