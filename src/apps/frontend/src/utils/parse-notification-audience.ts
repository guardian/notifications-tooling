import z from 'zod';
import type {
	DisplayAppAlertTopicEditionId,
	NewsletterSegmentId,
} from '../../../../packages/models';
import {
	appAlertTopicEditionId,
	newsletterSegmentId,
	NotificationChannel,
	toDisplayEditionId,
} from '../../../../packages/models';
import type { NotificationSummary } from '../schemas';

const appAudienceJsonData = z.looseObject({
	compose: z.record(z.string(), z.unknown()),
	audience: z.looseObject({
		type: z.string(),
		items: z
			.looseObject({
				name: z.string(),
				type: z.string(),
			})
			.array(),
	}),
});

const newsletterAudienceJsonData = z.looseObject({
	compose: z.record(z.string(), z.unknown()),
	audience: z.looseObject({
		type: z.string(),
		items: z.string().array(),
	}),
});

export const parseAudience = (
	send: NotificationSummary,
): Array<NewsletterSegmentId | DisplayAppAlertTopicEditionId> => {
	const audiences: Array<NewsletterSegmentId | DisplayAppAlertTopicEditionId> =
		[];
	Object.entries(send.channels).flatMap(([channelId, data]) => {
		if (
			(channelId as NotificationChannel) ===
			NotificationChannel.AppPushNotification
		) {
			const parseResult = appAudienceJsonData.safeParse(data);
			if (parseResult.success) {
				audiences.push(
					...parseResult.data.audience.items
						.map((item) => item.name)
						.flatMap((name) => {
							const parsedName = appAlertTopicEditionId.safeParse(name);
							return parsedName.success
								? toDisplayEditionId(parsedName.data)
								: [];
						}),
				);
			}
		}

		if ((channelId as NotificationChannel) == NotificationChannel.Newsletter) {
			const parseResult = newsletterAudienceJsonData.safeParse(data);
			if (parseResult.success) {
				audiences.push(
					...parseResult.data.audience.items.flatMap((name) => {
						const parsedName = newsletterSegmentId.safeParse(name);
						return parsedName.success ? parsedName.data : [];
					}),
				);
			}
		}
	});
	return Array.from(new Set(audiences));
};
