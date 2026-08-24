import { kickerNameMap } from './option-values';
import type { KickerId } from './types';

export const composeNewsletterSubject = (subject: string, kicker?: KickerId) =>
	kicker ? `${kickerNameMap[kicker]}: ${subject}` : subject;
