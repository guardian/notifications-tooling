import type {
	AppAlertTopicEditionId,
	NewsletterEditionOption,
	NewsletterSegmentId,
	TopicTypeEditionOption,
} from '@models';
import {
	FALLBACK_APP_ALERT_EDITIONS,
	FALLBACK_NEWSLETTER_EDITIONS,
	useChannelAudiences,
} from './api/useChannelAudiences';
import { EDITION_OPTIONS } from './components/EditionOptions';
import type { SegmentOption } from './components/SegmentPicker';
import type { ChannelOption, Edition } from './types';

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

const topicIdToCodeMap: Record<AppAlertTopicEditionId, Edition> = {
	uk: 'UK',
	us: 'US',
	au: 'AU',
	europe: 'EU',
	international: 'INT',
};

export const useTopicEditionOptions = (
	topicId: string,
): Array<SegmentOption<Edition>> => {
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
		code: topicIdToCodeMap[id],
		label,
	}));
};
