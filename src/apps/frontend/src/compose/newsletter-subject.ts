import { kickerNameMap } from '../option-values';
import type { Kicker } from '../schemas';

export const composeNewsletterSubject = (subject: string, kicker?: Kicker) =>
	kicker && kicker !== 'none'
		? `${kickerNameMap[kicker]}: ${subject}`
		: subject;
