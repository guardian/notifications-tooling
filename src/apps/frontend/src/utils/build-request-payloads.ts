import { type ResolvedArticle, toApiEditionId } from '@models';
import type { SendNotificationRequest } from '../schemas';
import { getArticleThumbnail } from './article-thumbnail';
import { composeNewsletterSubject } from './newsletter-subject';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from './notification-forms';
import { alertTypeNameMap } from './option-values';

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
	const thumbnailUrl = getArticleThumbnail(content).src;

	const emailSubjectLine = composeNewsletterSubject(headline, kicker);

	return {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'newsletter',
					title: headline,
					body: preview,
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

export const buildAppAlertRequest = ({
	values,
	content,
	idempotencyKey,
}: BuildRequestArgs<AppAlertFormValues>): SendNotificationRequest => {
	const { alertType, editions, headline, includeThumbnail } = values;
	const thumbnailUrl = getArticleThumbnail(content).src;

	return {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'app-push',
					title: alertTypeNameMap[alertType],
					body: headline,
					link: content.webUrl,
					...(includeThumbnail && thumbnailUrl
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
						name: toApiEditionId(edition),
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
