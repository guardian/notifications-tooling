import type { NewsletterEditionOption, TopicTypeEditionOption } from '@models';
import {
	FALLBACK_APP_ALERT_EDITIONS,
	FALLBACK_NEWSLETTER_EDITIONS,
	useChannelAudiences,
} from './api/useChannelAudiences';
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
