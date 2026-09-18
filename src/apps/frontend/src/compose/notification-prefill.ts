import { displayAppAlertTopicEditionId, newsletterSegmentId } from '@models';
import { z } from 'zod';
import type { ChannelOption } from '../types';
import {
	type AppAlertFormValues,
	type NewsletterEmailFormValues,
} from '../utils/notification-forms';

type EditableFormValues<FormValues> = Partial<
	Omit<FormValues, 'notificationId'>
>;

export type NotificationPrefillByChannel = {
	newsletter: {
		articleUrl?: string;
		fields?: EditableFormValues<NewsletterEmailFormValues>;
	};
	'app-push': {
		articleUrl?: string;
		fields?: EditableFormValues<AppAlertFormValues>;
	};
};

type NotificationPrefill<Channel extends ChannelOption> =
	NotificationPrefillByChannel[Channel] & { channel: Channel };

export type NotificationPrefillState<Channel extends ChannelOption> = {
	notificationPrefill: NotificationPrefill<Channel>;
};

const newsletterPrefillFieldsSchema = z
	.object({
		kicker: z.string(),
		subjectText: z.string(),
		previewText: z.string(),
		showPreview: z.boolean(),
		audienceSegments: z.array(newsletterSegmentId),
		deliveryOption: z.literal('immediate'),
	})
	.partial();

const appAlertPrefillFieldsSchema = z
	.object({
		alertType: z.string(),
		headline: z.string(),
		editions: z.array(displayAppAlertTopicEditionId),
		includeThumbnail: z.boolean(),
		articleThumbnailUrl: z.string().optional(),
		deliveryOption: z.literal('appImmediate'),
	})
	.partial();

const prefillSchemas = {
	newsletter: z.object({
		channel: z.literal('newsletter'),
		articleUrl: z.string().optional(),
		fields: newsletterPrefillFieldsSchema.optional(),
	}),
	'app-push': z.object({
		channel: z.literal('app-push'),
		articleUrl: z.string().optional(),
		fields: appAlertPrefillFieldsSchema.optional(),
	}),
} as const;

export const createNotificationPrefillState = <Channel extends ChannelOption>(
	channel: Channel,
	prefill: NotificationPrefillByChannel[Channel],
): NotificationPrefillState<Channel> => ({
	notificationPrefill: { channel, ...prefill },
});

export const parseNotificationPrefill = <Channel extends ChannelOption>(
	state: unknown,
	channel: Channel,
): NotificationPrefill<Channel> | undefined => {
	if (
		!state ||
		typeof state !== 'object' ||
		!('notificationPrefill' in state)
	) {
		return undefined;
	}

	const result = prefillSchemas[channel].safeParse(state.notificationPrefill);
	return result.success
		? (result.data as NotificationPrefill<Channel>)
		: undefined;
};
