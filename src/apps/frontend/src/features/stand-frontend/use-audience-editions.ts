import type {
	NewsletterEditionOption,
	NewsletterSegmentId,
	TopicTypeEditionOption,
} from '@models';
import {
	FALLBACK_APP_ALERT_EDITIONS,
	FALLBACK_NEWSLETTER_EDITIONS,
	useChannelAudiences,
} from './api/useChannelAudiences';
import type { SegmentOption } from './components/SegmentPicker';
import type { ChannelOption } from './types';

export const useAudienceEditions = (
	channel: ChannelOption,
	topicId?: string,
): NewsletterEditionOption[] | TopicTypeEditionOption[] => {
	const { data: audiences } = useChannelAudiences();

	if (channel === 'email') {
		return (
			audiences?.channels.newsletter.segments ?? FALLBACK_NEWSLETTER_EDITIONS
		);
	}

	if (!topicId) {
		return FALLBACK_APP_ALERT_EDITIONS;
	}

	return (
		audiences?.channels['app-push'].topicTypes.find(
			(topic) => topic.id === topicId,
		)?.editions ?? FALLBACK_APP_ALERT_EDITIONS
	);
};

export const FALLBACK_SEGMENT_OPTIONS: Array<
	SegmentOption<NewsletterSegmentId>
> = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];

export const useNewsletterSegmentOptions = (): Array<
	SegmentOption<NewsletterSegmentId>
> => {
	const { data: audiences } = useChannelAudiences();
	const segments = audiences?.channels.newsletter.segments;
	return segments
		? segments.map(({ id, label }) => ({ code: id, label }))
		: FALLBACK_SEGMENT_OPTIONS;
};
