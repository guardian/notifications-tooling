import type { AudienceSegment } from './email/braze/campaigns';
import {
	generateNotificationChannelRequests,
	type NotificationChannelConfig,
	type NotificationChannelRequestInput,
} from './generate-requests';
import {
	invokeNotificationChannelRequests,
	type NotificationChannelClients,
	type NotificationChannelInvocationResult,
} from './invoke-requests';

type NotificationContentItem = {
	type: 'newsletter' | 'app-push-notification';
	title: string;
	body: string;
	link: string;
	media?: {
		type: 'image';
		imageUrl: string;
		thumbnailUrl?: string;
	};
};

type NewsletterPlan = {
	channel: 'newsletter';
	audience: {
		type: 'segment';
		segments: ReadonlyArray<{ id: AudienceSegment }>;
	};
	compose: {
		items: readonly string[];
		subject: string;
	};
};

type AppPushNotificationPlan = {
	channel: 'app-push-notification';
	audience: {
		type: 'topic';
		topics: ReadonlyArray<{ type: string; name: string }>;
	};
	compose: { use: string };
};

export type NotificationDispatchRequest = {
	content: { items: Readonly<Record<string, NotificationContentItem>> };
	channels: ReadonlyArray<NewsletterPlan | AppPushNotificationPlan>;
};

export type NewsletterRenderer = {
	render: (input: {
		items: readonly NotificationContentItem[];
		subject: string;
	}) => Promise<string>;
};

export type DispatchNotificationDependencies = {
	generatorConfig: NotificationChannelConfig;
	clients: NotificationChannelClients;
	newsletterRenderer: NewsletterRenderer;
};

const createChannelRequestInputs = async (
	request: NotificationDispatchRequest,
	newsletterRenderer: NewsletterRenderer,
): Promise<NotificationChannelRequestInput[]> => {
	const inputs = await Promise.all(
		request.channels.map(
			async (plan): Promise<NotificationChannelRequestInput[]> => {
				if (plan.channel === 'app-push-notification') {
					const item = request.content.items[plan.compose.use];
					if (item?.type !== 'app-push-notification') {
						throw new Error(
							`App-push content item '${plan.compose.use}' was not found.`,
						);
					}

					return [
						{
							channel: 'app-notification',
							request: {
								topics: plan.audience.topics,
								title: item.title,
								body: item.body,
								link: item.link,
								media: item.media,
							},
						},
					];
				}

				const items = plan.compose.items.map((itemId) => {
					const item = request.content.items[itemId];
					if (!item) {
						throw new Error(`Content item '${itemId}' was not found.`);
					}
					return item;
				});
				const html = await newsletterRenderer.render({
					items,
					subject: plan.compose.subject,
				});

				return plan.audience.segments.map(({ id }) => ({
					channel: 'email',
					audienceSegment: id,
					html,
					subject: plan.compose.subject,
				}));
			},
		),
	);

	return inputs.flat();
};

export const dispatchNotification = async (
	request: NotificationDispatchRequest,
	dependencies: DispatchNotificationDependencies,
): Promise<NotificationChannelInvocationResult[]> => {
	const inputs = await createChannelRequestInputs(
		request,
		dependencies.newsletterRenderer,
	);
	const generatedRequests = generateNotificationChannelRequests(
		inputs,
		dependencies.generatorConfig,
	);

	return invokeNotificationChannelRequests(
		generatedRequests,
		dependencies.clients,
	);
};
