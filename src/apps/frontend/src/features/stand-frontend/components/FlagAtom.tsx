import type { AudienceSegment, Edition } from '../types';
import {
	auFlag,
	euFlag,
	internationalGlobe,
	ukFlag,
	usFlag,
} from './FlagIcons';

export const FlagAtom = ({
	segmentCode,
}: {
	segmentCode: AudienceSegment | Edition;
}) => {
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
