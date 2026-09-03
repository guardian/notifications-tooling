import {
	appAlertTopicEditionId,
	displayAppAlertTopicEditionId,
	type DisplayAppAlertTopicEditionId,
	toDisplayEditionId,
} from '@models';
import { z } from 'zod';
import type {
	ChannelAudienceResponse,
	NotificationSummary,
} from '../schemas';
import type { HistoryNotification } from './HistoryView';

const contentItemSchema = z.object({
	title: z.string(),
	body: z.string(),
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
				audience: z.discriminatedUnion('type', [
					z.object({
						type: z.literal('segment'),
						items: z.array(displayAppAlertTopicEditionId),
					}),
					z.object({
						type: z.literal('email'),
						items: z.array(z.string()),
					}),
				]),
				variants: z.array(displayAppAlertTopicEditionId).optional(),
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

const toEdition = (id: string): DisplayAppAlertTopicEditionId | undefined => {
	const upperCaseId = id.toUpperCase();
	const parsedDisplayEditionId =
		displayAppAlertTopicEditionId.safeParse(upperCaseId);
	if (parsedDisplayEditionId.success) {
		return parsedDisplayEditionId.data;
	}
	const parsedEditionId = appAlertTopicEditionId.safeParse(id);
	return parsedEditionId.success
		? toDisplayEditionId(parsedEditionId.data)
		: undefined;
};

const statusDisplay: Record<
	NotificationSummary['status'],
	HistoryNotification['status']
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

export const mapNotificationToHistoryNotification = (
	notification: NotificationSummary,
	audiences?: ChannelAudienceResponse,
): HistoryNotification | undefined => {
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
		? newsletter.audience.type === 'segment'
			? newsletter.audience.items
			: (newsletter.variants ?? [])
		: appPushAudience
			.map(({ name }) => toEdition(name))
			.filter(
				(edition): edition is DisplayAppAlertTopicEditionId =>
					edition !== undefined,
			);
	const topicTypeId = appPushAudience[0]?.type;
	const alertType = topicTypeId
		? (audiences?.channels['app-push'].topicTypes.find(
			({ id }) => id === topicTypeId,
		)?.label ?? topicTypeId)
		: getNewsletterAlertType(newsletter?.compose.subject ?? '');

	return {
		id: notification.id,
		title: channel === 'push' ? content.body : content.title,
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
