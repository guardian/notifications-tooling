import { DisplayAppAlertTopicEditionId, NewsletterSegmentId } from '@models/api-contract/audience';
import {
	auFlag,
	euFlag,
	internationalGlobe,
	ukFlag,
	usFlag,
} from './FlagIcons';

export const FlagAtom = ({ segmentCode }: { segmentCode: NewsletterSegmentId | DisplayAppAlertTopicEditionId }) => {
	switch (segmentCode) {
		case 'UK':
			return ukFlag;
		case 'US':
			return usFlag;
		case 'AU':
			return auFlag;
		case 'EU':
			return euFlag;
		case 'INT':
			return internationalGlobe;
		default:
			return null;
	}
};
