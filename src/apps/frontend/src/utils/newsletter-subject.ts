import type { Kicker } from '../schemas';
import { kickerNameMap } from './option-values';

export const composeNewsletterSubject = (subject: string, kicker?: Kicker) =>
	kicker && kicker !== 'none'
		? `${kickerNameMap[kicker]}: ${subject}`
		: subject;
