import { z } from 'zod';
import type {
	ChannelAudienceResponse,
	NotificationSummary,
} from './api/schemas';
import type { HistoryAlert } from './components/HistoryTab';
import { editionIds } from './edition-values';
import type { Edition } from './types';

const contentItemSchema = z.object({
	title: z.string(),
	link: z.string(),
	type: z.enum(['newsletter', 'app-push']),
	media: z
		.object({
			thumbnailUrl: z.string().optional(),
			imageUrl: z.string(),
		})
		.optional(),
});

const notificationPayloadSchema = z.object({
	content: z.object({ items: z.record(z.string(), contentItemSchema) }),
	channels: z.object({
		newsletter: z
			.object({
				audience: z.object({ items: z.array(z.string()) }),
				variants: z.array(z.enum(['UK', 'US', 'AU', 'EU', 'INT'])),
				compose: z.object({
					items: z.array(z.string()),
					subject: z.string(),
				}),
			})
			.optional(),
		'app-push': z
			.object({
				audience: z.object({
					items: z.array(z.object({ type: z.string(), name: z.string() })),
				}),
				compose: z.object({ use: z.string() }),
			})
			.optional(),
	}),
});

const editionsById = Object.fromEntries(
	Object.entries(editionIds).map(([edition, id]) => [id, edition]),
) as Record<string, Edition>;

const toEdition = (id: string): Edition | undefined => {
	const upperCaseId = id.toUpperCase();
	if (['UK', 'US', 'AU', 'EU', 'INT'].includes(upperCaseId)) {
		return upperCaseId as Edition;
	}
	return editionsById[id];
};

const statusDisplay: Record<
	NotificationSummary['status'],
	HistoryAlert['status']
> = {
	accepted: 'Accepted',
	delivered: 'Sent',
	partially_delivered: 'Partially sent',
	failed: 'Failed',
};

const getNewsletterAlertType = (subject: string): string => {
	const kicker = subject.match(/^(Breaking News|Exclusive):/i)?.[1];
	return kicker ?? 'Newsletter';
};

export const mapNotificationToHistoryAlert = (
	notification: NotificationSummary,
	audiences?: ChannelAudienceResponse,
): HistoryAlert | undefined => {
	const payload = notificationPayloadSchema.safeParse({
		content: notification.content,
		channels: notification.channels,
	});
	if (!payload.success) {
		return undefined;
	}

	const newsletter = payload.data.channels.newsletter;
	const appPush = payload.data.channels['app-push'];
	const channel = appPush ? 'push' : newsletter ? 'email' : undefined;
	const contentKey = appPush?.compose.use ?? newsletter?.compose.items[0];
	const content = contentKey
		? payload.data.content.items[contentKey]
		: undefined;
	if (!channel || !content) {
		return undefined;
	}

	const appPushAudience = appPush?.audience.items ?? [];
	const sentTo = newsletter
		? newsletter.variants
		: appPushAudience
				.map(({ name }) => toEdition(name))
				.filter((edition): edition is Edition => edition !== undefined);
	const topicTypeId = appPushAudience[0]?.type;
	const alertType = topicTypeId
		? (audiences?.channels['app-push'].topicTypes.find(
				({ id }) => id === topicTypeId,
			)?.label ?? topicTypeId)
		: getNewsletterAlertType(newsletter?.compose.subject ?? '');

	return {
		id: notification.id,
		title: content.title,
		href: content.link,
		thumbnailUrl: content.media?.thumbnailUrl ?? content.media?.imageUrl,
		channel,
		alertType,
		sentBy: notification.createdByEmail,
		sentTo,
		sentAt: notification.createdAt,
		status: statusDisplay[notification.status],
	};
};
