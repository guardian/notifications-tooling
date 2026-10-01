import z from 'zod';
import { NotificationChannel } from '../../../../packages/models';
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

export const parseAudience = (send: NotificationSummary): string[] => {
	const audiences: string[] = [];
	Object.entries(send.channels).flatMap(([channelId, data]) => {
		if (
			(channelId as NotificationChannel) ===
			NotificationChannel.AppPushNotification
		) {
			const parseResult = appAudienceJsonData.safeParse(data);
			if (parseResult.success) {
				audiences.push(
					...parseResult.data.audience.items.map((item) => item.name),
				);
			}
		}

		if ((channelId as NotificationChannel) == NotificationChannel.Newsletter) {
			const parseResult = newsletterAudienceJsonData.safeParse(data);
			if (parseResult.success) {
				audiences.push(...parseResult.data.audience.items);
			}
		}
	});

	return audiences;
};
