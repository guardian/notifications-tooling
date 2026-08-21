import type { ResolvedArticle } from '@models';
import type { SendNotificationRequest } from './api/schemas';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from './notification-forms';
import { kickerNameMap } from './option-values';
import { alertTypeNameMap } from './option-values';
import type { Edition } from './types';

type BuildRequestArgs<Values> = {
	values: Values;
	content: ResolvedArticle;
	idempotencyKey: string;
};

export const buildNewsletterRequest = ({
	values,
	content,
	idempotencyKey,
}: BuildRequestArgs<NewsletterFormValues>): SendNotificationRequest => {
	const { subject: headline, preview, audienceSegments, kicker } = values;

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

const editionIds: Record<Edition, string> = {
	UK: 'uk',
	US: 'us',
	AU: 'au',
	EU: 'europe',
	INT: 'international',
};

export const buildAppAlertRequest = ({
	values,
	content,
	idempotencyKey,
}: BuildRequestArgs<AppAlertFormValues>): SendNotificationRequest => {
	const { alertType, editions, headline } = values;
	const thumbnailUrl = content.fields?.thumbnail;

	return {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'app-push',
					title: alertTypeNameMap[alertType],
					body: headline,
					link: content.webUrl,
					...(thumbnailUrl
						? {
							media: {
								type: 'image' as const,
								imageUrl: thumbnailUrl,
								thumbnailUrl,
							},
						}
						: {}),
				},
			},
		},
		channels: {
			'app-push': {
				audience: {
					type: 'topic',
					items: editions.map((edition) => ({
						type: alertType,
						name: editionIds[edition],
					})),
				},
				compose: { use: 'lead-story' },
			},
		},
		sender: 'notifications-tooling-spa/v1',
		options: {
			dryRun: false,
			scheduledFor: null,
		},
	};
};
