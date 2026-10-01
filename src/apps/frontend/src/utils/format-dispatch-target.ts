import {
	appAlertTopicEditionId,
	displayAppAlertTopicEditionId,
	toDisplayEditionId,
} from '@models';
import type { ChannelAudienceResponse, NotificationDispatch } from '../schemas';
import { getAudienceEditionLabel } from './audience-edition-label';

export const formatDispatchTarget = (
	requested: NotificationDispatch['requested'],
	audiences?: ChannelAudienceResponse,
): string => {
	if (requested.channel === 'newsletter') {
		const edition = displayAppAlertTopicEditionId.safeParse(requested.segment);
		return edition.success
			? getAudienceEditionLabel({
					audiences,
					channel: 'newsletter',
					edition: edition.data,
				})
			: requested.segment;
	}

	return requested.editions
		.map((edition) => {
			const parsedEdition = appAlertTopicEditionId.safeParse(edition);
			return parsedEdition.success
				? getAudienceEditionLabel({
						audiences,
						channel: 'app-push',
						edition: toDisplayEditionId(parsedEdition.data),
						topicTypeId: requested.topicType,
					})
				: edition;
		})
		.join(', ');
};
