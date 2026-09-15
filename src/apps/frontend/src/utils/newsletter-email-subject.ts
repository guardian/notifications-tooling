import type { Kicker } from '../schemas';
import { kickerNameMap } from './option-values';

export const composeNewsletterEmailSubjectLine = (
	subjectText: string,
	kicker?: Kicker,
) =>
	kicker && kicker !== 'none'
		? `${kickerNameMap[kicker]}: ${subjectText}`
		: subjectText;
