import { type CapiBlock, type ResolvedArticle, toApiEditionId } from '@models';
import type { SendNotificationRequest } from '../schemas';
import { getArticleThumbnail } from './article-thumbnail';
import { composeNewsletterSubject } from './newsletter-subject';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from './notification-forms';

type BuildRequestArgs<Values> = {
	values: Values;
	content: ResolvedArticle;
	idempotencyKey: string;
	requestedUrl?: string;
	requestedBlock?: CapiBlock;
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
	alertTypeLabel,
	content,
	idempotencyKey,
	requestedUrl,
	requestedBlock,
}: BuildRequestArgs<AppAlertFormValues> & {
	alertTypeLabel: string;
}): SendNotificationRequest => {
	const {
		alertType,
		editions,
		headline,
		includeThumbnail,
		articleThumbnailUrl,
	} = values;
	let thumbnailUrl = articleThumbnailUrl;
	if (thumbnailUrl === undefined || thumbnailUrl === '') {
		thumbnailUrl = getArticleThumbnail(content, requestedBlock).src;
	}

	return {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'app-push',
					title: alertTypeLabel,
					body: headline,
					link: requestedUrl ?? content.webUrl,
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
