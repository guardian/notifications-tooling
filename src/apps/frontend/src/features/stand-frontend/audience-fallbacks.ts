import type {
	AppAlertTopicOption,
	NewsletterSegmentOption,
	TopicTypeEditionOption,
} from '@models';

const FALLBACK_APP_ALERT_EDITIONS: TopicTypeEditionOption[] = [
	{ id: 'uk', label: 'UK' },
	{ id: 'us', label: 'US' },
	{ id: 'au', label: 'AU' },
	{ id: 'international', label: 'International' },
	{ id: 'europe', label: 'Europe' },
];

export const FALLBACK_TOPIC_TYPES: AppAlertTopicOption[] = [
	{
		id: 'breaking-news',
		label: 'Breaking news',
		editions: FALLBACK_APP_ALERT_EDITIONS,
	},
];

export const FALLBACK_NEWSLETTER_SEGMENTS: NewsletterSegmentOption[] = [
	{ id: 'UK', label: 'United Kingdom' },
	{ id: 'US', label: 'United States' },
	{ id: 'AU', label: 'Australia' },
];
