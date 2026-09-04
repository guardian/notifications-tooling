import {
	type DisplayAppAlertTopicEditionId,
	type NewsletterSegmentId,
	toDisplayEditionId,
} from '@models';
import { FALLBACK_NEWSLETTER_SEGMENTS } from './audience-fallbacks';
import { EDITION_OPTIONS } from './EditionOptions';
import type { SegmentOption } from './SegmentPicker';
import { useChannelAudiences } from './useChannelAudiences';

export const useNewsletterSegmentOptions = (): Array<
	SegmentOption<NewsletterSegmentId>
> => {
	const { data: audiences } = useChannelAudiences();
	const segments = audiences?.channels.newsletter.segments;
	return (segments ?? FALLBACK_NEWSLETTER_SEGMENTS).map(({ id, label }) => ({
		code: id,
		label,
	}));
};

export const useTopicEditionOptions = (
	topicId: string,
): Array<SegmentOption<DisplayAppAlertTopicEditionId>> => {
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
		code: toDisplayEditionId(id),
		label,
	}));
};
