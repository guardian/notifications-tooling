import type {
	AppAlertTopicEditionId,
	FrontendAppAlertTopicEditionId,
} from '@models';

export const editionIds: Record<
	FrontendAppAlertTopicEditionId,
	AppAlertTopicEditionId
> = {
	UK: 'uk',
	US: 'us',
	AU: 'au',
	EU: 'europe',
	INT: 'international',
};
