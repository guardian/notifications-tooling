import type { AudienceSegment } from '../types';
import { auFlag, ukFlag, usFlag } from './FlagIcons';

export const FlagAtom = ({ segmentCode }: { segmentCode: AudienceSegment }) => {
	switch (segmentCode) {
		case 'UK':
			return ukFlag;
		case 'US':
			return usFlag;
		case 'AU':
			return auFlag;
		default:
			return null;
	}
};
