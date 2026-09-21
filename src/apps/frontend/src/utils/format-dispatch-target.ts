import type { ChannelAudienceResponse, NotificationDispatch } from '../schemas';
import {
	FALLBACK_NEWSLETTER_EMAIL_SEGMENTS,
	FALLBACK_TOPIC_TYPES,
} from '../segment/audience-fallbacks';

export const formatDispatchTarget = (
	requested: NotificationDispatch['requested'],
	audiences?: ChannelAudienceResponse,
): string => {
	if (requested.channel === 'newsletter') {
		const segments = audiences?.channels.newsletter.segments ?? [];
		return (
			segments.find(({ id }) => id === requested.segment)?.label ??
			FALLBACK_NEWSLETTER_EMAIL_SEGMENTS.find(
				({ id }) => id === requested.segment,
			)?.label ??
			requested.segment
		);
	}

	const topicTypes = audiences?.channels['app-push'].topicTypes ?? [];
	const topic = topicTypes.find(({ id }) => id === requested.topicType);
	const fallbackTopic = FALLBACK_TOPIC_TYPES.find(
		({ id }) => id === requested.topicType,
	);

	return requested.editions
		.map(
			(edition) =>
				topic?.editions.find(({ id }) => id === edition)?.label ??
				fallbackTopic?.editions.find(({ id }) => id === edition)?.label ??
				edition,
		)
		.join(', ');
};
