import { z } from 'zod';

export const historyAlertTypeSchema = z.enum([
	'breaking-news',
	'exclusive',
	'editors-picks',
	'one-not-to-miss',
	'sport',
]);

export type HistoryAlertType = z.infer<typeof historyAlertTypeSchema>;

export const canonicalHistoryAlertTypes = <Type extends string>(
	alertTypes: readonly Type[],
): Type[] => [...new Set(alertTypes)].sort();
