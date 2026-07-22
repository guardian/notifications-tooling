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

	if (Object.keys(request.channels).length !== 1) {
		throw new Error('Only one notification channel can be sent at a time.');
	}

	const newsletterPlan = request.channels[NotificationChannel.Newsletter];
	if (newsletterPlan) {
		if (newsletterPlan.audience.type !== 'segment') {
			throw new Error('Sending test emails is not implemented.');
		}
		if (newsletterPlan.compose.items.length !== 1) {
			throw new Error('Only one newsletter item can be rendered currently.');
		}

		const item = requireContentItem(
			request,
			newsletterPlan.compose.items[0]!,
			NotificationChannel.Newsletter,
		);
		const environment = newsletterEnvironmentSchema.parse(
			dependencies.environment,
		);

		for (const segmentId of newsletterPlan.audience.items) {
			const { brazeCampaignId } = newsletterSegments[segmentId];
			if (!brazeCampaignId.trim()) {
				throw new Error(
					`No Braze campaign ID is configured for newsletter segment '${segmentId}'.`,
				);
			}

			const html = await dependencies.renderEmail({
				endpoint: environment.EMAIL_RENDERING_ENDPOINT,
				articleUrl: item.link,
				newsletterId: segmentId,
			});

			await dependencies.sendBrazeCampaign({
				apiKey: environment.BRAZE_API_KEY,
				restEndpoint: environment.BRAZE_REST_ENDPOINT,
				campaignId: brazeCampaignId,
				html,
				subject: newsletterPlan.compose.subject,
			});
		}

		return;
	}

	const appPushPlan = request.channels[NotificationChannel.AppPushNotification];
	if (appPushPlan) {
		const item = requireContentItem(
			request,
			appPushPlan.compose.use,
			NotificationChannel.AppPushNotification,
		);
		await dependencies.sendAppNotification({
			topics: appPushPlan.audience.items.map(
				(segmentId) => appPushNotificationSegments[segmentId].mobileN10nTopic,
			),
			title: item.title,
			body: item.body,
			link: item.link,
			media: item.media,
		});
	}
};
