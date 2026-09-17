import {
	appAlertTopicEditionId,
	displayAppAlertTopicEditionId,
	type DisplayAppAlertTopicEditionId,
	toDisplayEditionId,
} from '@models';
import { z } from 'zod';
import type { HistoryNotification } from '../history/HistoryView';
import type { ChannelAudienceResponse, NotificationSummary } from '../schemas';

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

const getNewsletterEmailAlertType = (subjectLine: string): string => {
	const kicker = subjectLine.match(/^(Breaking news|Exclusive):/i)?.[1];
	return kicker ?? 'Newsletter';
};

export const getSenderDisplayName = (createdByEmail: string): string => {
	const [senderName] = createdByEmail.split('@');
	const names = senderName?.split(/[._-]+/).filter(Boolean) ?? [];
	if (names.length === 0) {
		return createdByEmail;
	}

	return names
		.map((name) => `${name[0]?.toUpperCase()}${name.slice(1).toLowerCase()}`)
		.join(' ');
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

	const newsletterEmailPlan = payload.data.channels.newsletter;
	const appAlertPlan = payload.data.channels['app-push'];
	const channel = appAlertPlan
		? 'app-push'
		: newsletterEmailPlan
			? 'newsletter'
			: undefined;
	const contentKey =
		appAlertPlan?.compose.use ?? newsletterEmailPlan?.compose.items[0];
	const contentItem = contentKey
		? payload.data.content.items[contentKey]
		: undefined;
	if (!channel || !contentItem) {
		return undefined;
	}

	const appAlertAudience = appAlertPlan?.audience.items ?? [];
	const sentTo = newsletterEmailPlan
		? newsletterEmailPlan.audience.type === 'segment'
			? newsletterEmailPlan.audience.items
			: (newsletterEmailPlan.variants ?? [])
		: appAlertAudience
				.map(({ name }) => toEdition(name))
				.filter(
					(edition): edition is DisplayAppAlertTopicEditionId =>
						edition !== undefined,
				);
	const topicTypeId = appAlertAudience[0]?.type;
	const alertType = topicTypeId
		? (audiences?.channels['app-push'].topicTypes.find(
				({ id }) => id === topicTypeId,
			)?.label ?? topicTypeId)
		: getNewsletterEmailAlertType(newsletterEmailPlan?.compose.subject ?? '');

	return {
		id: notification.id,
		title: channel === 'app-push' ? contentItem.body : contentItem.title,
		href: contentItem.link,
		thumbnailUrl:
			contentItem.media?.thumbnailUrl ?? contentItem.media?.imageUrl,
		channel,
		alertType,
		sentBy: notification.createdByEmail,
		sentTo,
		sentAt: notification.createdAt,
		status: statusDisplay[notification.status],
	};
};
