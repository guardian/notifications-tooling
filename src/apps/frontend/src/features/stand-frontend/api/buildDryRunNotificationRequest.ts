import type { NotificationDraft } from '../useNotificationDraft';
import type { SendNotificationRequest } from './schemas';

const contentItemId = 'lead-story';
const editorialBreakingNews = 'editorial-breaking-news';

export const buildDryRunNotificationRequest = (
	idempotencyKey: string,
	draft: NotificationDraft,
): SendNotificationRequest => ({
	idempotencyKey,
	category: 'editorial' as const,
	priority: 'standard' as const,
	content: {
		items: {
			[contentItemId]: {
				type: 'newsletter' as const,
				title: draft.subject,
				body: draft.previewText,
				link: draft.articleUrl,
			},
		},
	},
	channels: {
		newsletter: {
			audience: {
				type: 'segment' as const,
				items: [editorialBreakingNews],
			},
			compose: {
				items: [contentItemId],
				subject: draft.subject,
			},
		},
	},
	sender: editorialBreakingNews,
	options: {
		dryRun: true,
		scheduledFor: null,
	},
});
