import { type CapiBlock, type ResolvedArticle, toApiEditionId } from '@models';
import type { SendNotificationRequest } from '../schemas';
import { getArticleThumbnail } from './article-thumbnail';
import { composeNewsletterEmailSubjectLine } from './newsletter-email-subject';
import type {
	AppAlertFormValues,
	NewsletterEmailFormValues,
} from './notification-forms';

/** Identifier for the originating system, shared across every channel. */
export const senderId = 'dispatch-app';

type BuildRequestArgs<Values> = {
	values: Values;
	article: ResolvedArticle;
	idempotencyKey: string;
	requestedUrl?: string;
	requestedBlock?: CapiBlock;
};

type AppAlertRequestFormValues = Omit<
	AppAlertFormValues,
	'replacementImageUrl'
>;

export const buildNewsletterEmailRequest = ({
	values,
	article,
	idempotencyKey,
	requestedUrl,
}: BuildRequestArgs<NewsletterEmailFormValues>): SendNotificationRequest => {
	const { subjectText, previewText, audienceSegments, kicker } = values;
	const thumbnailUrl = getArticleThumbnail(article).src;

	const subjectLine = composeNewsletterEmailSubjectLine(subjectText, kicker);

	return {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'newsletter',
					title: subjectText,
					body: previewText,
					link: requestedUrl ?? article.webUrl,
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
					subject: subjectLine,
				},
			},
		},
		sender: senderId,
		options: {
			dryRun: false,
			scheduledFor: null,
		},
	};
};

export const buildAppAlertRequest = ({
	values,
	alertTypeLabel,
	article,
	idempotencyKey,
	requestedUrl,
}: BuildRequestArgs<AppAlertRequestFormValues> & {
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
		thumbnailUrl = getArticleThumbnail(article).src;
	}

	return {
		idempotencyKey,
		content: {
			items: {
				'lead-story': {
					type: 'app-push',
					title: alertTypeLabel,
					body: headline,
					link: requestedUrl ?? article.webUrl,
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
		sender: senderId,
		options: {
			dryRun: false,
			scheduledFor: null,
		},
	};
};
