import {
	newsletterSegments,
	NotificationChannel,
	resolveAppPushTopic,
} from '@config';
import { getSSMParameter } from '@config/ssm';
import {
	registerBrazeTestEmailRecipients,
	renderEmail,
	sendAppNotification,
	sendBrazeCampaign,
	sendBrazeTestEmail,
} from '@services';
import { z } from 'zod';
import type {
	NotificationSendRequest,
	NotificationTestSendRequest,
} from '../routers/notifications/schemas/notification-send-request';

// Each provider request shares a fixed timeout; it is not configurable per
// environment.
const PROVIDER_REQUEST_TIMEOUT_MS = 10_000;

const newsletterEnvironmentSchema = z.object({
	BRAZE_API_KEY: z.string().trim().min(1),
	BRAZE_REST_ENDPOINT: z.url(),
	EMAIL_RENDERING_ENDPOINT: z.url(),
});

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

export type DispatchNotificationDependencies = {
	getSSMParameter: typeof getSSMParameter;
	renderEmail: typeof renderEmail;
	sendAppNotification: typeof sendAppNotification;
	sendBrazeCampaign: typeof sendBrazeCampaign;
	registerBrazeTestEmailRecipients: typeof registerBrazeTestEmailRecipients;
	sendBrazeTestEmail: typeof sendBrazeTestEmail;
};

const defaultDependencies: DispatchNotificationDependencies = {
	getSSMParameter,
	renderEmail,
	sendAppNotification,
	sendBrazeCampaign,
	registerBrazeTestEmailRecipients,
	sendBrazeTestEmail,
};

const requireContentItem = (
	request: NotificationSendRequest | NotificationTestSendRequest,
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

const resolveNewsletterDispatch = (request: NotificationSendRequest) => {
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

		return { brazeCampaignId, emailRenderingNewsletterId };
	});

	return { item, plan, segments };
};

const dispatchNewsletter = async (
	resolvedDispatch: ReturnType<typeof resolveNewsletterDispatch>,
	dependencies: DispatchNotificationDependencies,
): Promise<void> => {
	if (!resolvedDispatch) {
		return;
	}

	const { item, plan, segments } = resolvedDispatch;

	const [brazeApiKey, brazeRestEndpoint, emailRenderingEndpoint] =
		await Promise.all([
			dependencies.getSSMParameter('BRAZE_API_KEY'),
			dependencies.getSSMParameter('BRAZE_REST_ENDPOINT'),
			dependencies.getSSMParameter('EMAIL_RENDERING_ENDPOINT'),
		]);

	const environment = newsletterEnvironmentSchema.parse({
		BRAZE_API_KEY: brazeApiKey,
		BRAZE_REST_ENDPOINT: brazeRestEndpoint,
		EMAIL_RENDERING_ENDPOINT: emailRenderingEndpoint,
	});

	for (const { brazeCampaignId, emailRenderingNewsletterId } of segments) {
		const html = await dependencies.renderEmail({
			endpoint: environment.EMAIL_RENDERING_ENDPOINT,
			articleUrl: item.link,
			newsletterId: emailRenderingNewsletterId,
			headlineOverride: item.title,
			previewText: item.body,
			timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
		});

		await dependencies.sendBrazeCampaign({
			apiKey: environment.BRAZE_API_KEY,
			restEndpoint: environment.BRAZE_REST_ENDPOINT,
			campaignId: brazeCampaignId,
			html,
			subject: plan.compose.subject,
			timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
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
		topics: plan.audience.items.map(({ type, name }) => {
			const topic = resolveAppPushTopic(type, name);
			if (!topic) {
				throw new Error(
					`No mobile-n10n topic configured for alert type '${type}' edition '${name}'.`,
				);
			}
			return topic;
		}),
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

	const newsletterDispatch = resolveNewsletterDispatch(request);
	const appPushDispatch = resolveAppPushDispatch(request);

	// Delivery outcomes are not persisted yet. Retrying after a partial failure
	// can resend targets that already succeeded, so failures must not be retried
	// automatically until partial-delivery recovery is implemented.
	await Promise.all([
		dispatchNewsletter(newsletterDispatch, dependencies),
		dispatchAppPush(appPushDispatch, dependencies),
	]);
};

export const dispatchNotificationTest = async (
	request: NotificationTestSendRequest,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<void> => {
	const plan = request.channels[NotificationChannel.Newsletter];
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
	const renderedVariants = [];
	for (const segmentId of plan.variants) {
		renderedVariants.push({
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
	if (request.options.dryRun) {
		return;
	}

	await dependencies.registerBrazeTestEmailRecipients({
		apiKey: environment.BRAZE_API_KEY,
		restEndpoint: environment.BRAZE_REST_ENDPOINT,
		recipientEmails,
		timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
	});

	for (const { html } of renderedVariants) {
		await dependencies.sendBrazeTestEmail({
			apiKey: environment.BRAZE_API_KEY,
			restEndpoint: environment.BRAZE_REST_ENDPOINT,
			appId: configuration.BRAZE_APP_ID,
			from: configuration.BRAZE_TEST_EMAIL_FROM,
			replyTo: configuration.BRAZE_TEST_EMAIL_REPLY_TO,
			recipientEmails,
			html,
			subject: plan.compose.subject,
			timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
		});
	}
};
