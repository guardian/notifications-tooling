import type { AppAlertTopicEditionId, NewsletterSegmentId } from '@models';
import { useChannelAudiences } from './api/useChannelAudiences';
import { EDITION_OPTIONS } from './components/EditionOptions';
import type { SegmentOption } from './components/SegmentPicker';

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

export const useTopicEditionOptions = (
	topicId: string,
): Array<SegmentOption<AppAlertTopicEditionId>> => {
	const { data: audiences } = useChannelAudiences();
	const topics = audiences?.channels['app-push'].topicTypes;
	if (!topics) {
		return EDITION_OPTIONS;
	}

	const editionsForTopic = topics.find(
		(topic) => topic.id === topicId,
	)?.editions;

	if (!editionsForTopic) {
		return EDITION_OPTIONS;
	}

	return editionsForTopic.map(({ id, label }) => ({
		code: id,
		label,
	}));
};
