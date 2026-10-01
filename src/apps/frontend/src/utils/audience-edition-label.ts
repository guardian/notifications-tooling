import { type DisplayAppAlertTopicEditionId, toApiEditionId } from '@models';
import type { ChannelAudienceResponse } from '../schemas';
import {
	FALLBACK_NEWSLETTER_EMAIL_SEGMENTS,
	FALLBACK_TOPIC_TYPES,
} from '../segment/audience-fallbacks';
import type { ChannelOption } from '../types';

interface AudienceEditionLabelOptions {
	audiences?: ChannelAudienceResponse;
	channel?: ChannelOption;
	edition: DisplayAppAlertTopicEditionId;
	topicTypeId?: string;
}

export const getAudienceEditionLabel = ({
	audiences,
	channel,
	edition,
	topicTypeId,
}: AudienceEditionLabelOptions): string => {
	const newsletterLabel =
		audiences?.channels.newsletter.segments.find(({ id }) => id === edition)
			?.label ??
		FALLBACK_NEWSLETTER_EMAIL_SEGMENTS.find(({ id }) => id === edition)?.label;
	if (channel === 'newsletter') {
		return newsletterLabel ?? edition;
	}

	const topicTypes = audiences?.channels['app-push'].topicTypes ?? [];
	const topic = topicTypes.find(({ id }) => id === topicTypeId);
	const fallbackTopic = FALLBACK_TOPIC_TYPES.find(
		({ id }) => id === topicTypeId,
	);
	const apiEditionId = toApiEditionId(edition);
	const appLabel =
		topic?.editions.find(({ id }) => id === apiEditionId)?.label ??
		fallbackTopic?.editions.find(({ id }) => id === apiEditionId)?.label ??
		topicTypes
			.flatMap(({ editions }) => editions)
			.find(({ id }) => id === apiEditionId)?.label ??
		FALLBACK_TOPIC_TYPES.flatMap(({ editions }) => editions).find(
			({ id }) => id === apiEditionId,
		)?.label;
	return channel === 'app-push'
		? (appLabel ?? edition)
		: (newsletterLabel ?? appLabel ?? edition);
};
