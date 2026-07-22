import type { NotificationState } from './types';

export const checkIfReadyToSend = (
	notification: NotificationState,
): boolean => {
	const { parameters, fetchedArticleId } = notification;

	if (parameters?.type === 'email') {
		// TO DO - validate in full
		const {
			subject = '',
			preview = '',
			emailDeliveryOption,
			audienceSegments = [],
		} = parameters;
		return (
			!!fetchedArticleId &&
			subject.length > 0 &&
			preview.length > 0 &&
			audienceSegments.length > 0 &&
			!!emailDeliveryOption
		);
	}
	if (parameters?.type === 'push') {
		return false;
	}

	return false;
};
