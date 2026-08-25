import type { Kicker } from './api/schemas';
import { kickerNameMap } from './option-values';

export const composeNewsletterSubject = (subject: string, kicker?: Kicker) =>
	kicker && kicker !== 'none'
		? `${kickerNameMap[kicker]}: ${subject}`
		: subject;

export const stripKickerPrefix = (subject: string, kicker?: Kicker): string => {
	const prefixes = Object.values(kickerNameMap);
	const match =
		prefixes.find((label) => subject.startsWith(`${label}: `)) ??
		(kicker && kicker !== 'none' ? `${kickerNameMap[kicker]}` : undefined);
	return match ? subject.slice(`${match}: `.length) : subject;
};
