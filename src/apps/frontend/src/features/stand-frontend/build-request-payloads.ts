import type { SendNotificationRequest } from './api/schemas';
import { kickerNameMap } from './option-values';
import type { NotificationState } from './types';

export const buildRequest = (
	notification: NotificationState,
): SendNotificationRequest | undefined => {
	const { parameters, content } = notification;
	if (!content || parameters?.type !== 'email') {
		return undefined;
	}
	const { subject: headline, preview, audienceSegments, kicker } = parameters;
	if (!headline || !preview || !audienceSegments?.length) {
		return undefined;
	}
	const idempotencyKey = `email-notification:${content.id}`;

	const emailSubjectLine = kicker
		? `${kickerNameMap[kicker]}: ${headline}`
		: headline;

	return {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'newsletter',
					title: headline,
					body: preview,
					link: content.webUrl,
				},
			},
		},
		channels: {
			newsletter: {
				audience: {
					type: 'segment',
					items: audienceSegments,
				},
				compose: {
					items: ['lead-story'],
					subject: emailSubjectLine,
				},
			},
		},
		sender: 'editorial-newsletters',
		options: {
			dryRun: false,
			scheduledFor: null,
		},
	};
};
