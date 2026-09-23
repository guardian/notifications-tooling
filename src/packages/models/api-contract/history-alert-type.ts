import { z } from 'zod';

export const historyAlertTypeSchema = z.enum([
	'none',
	'breaking-news',
	'exclusive',
	'editors-picks',
	'one-not-to-miss',
	'sport',
]);

export type HistoryAlertType = z.infer<typeof historyAlertTypeSchema>;

export type KickerHistoryAlertType = Exclude<HistoryAlertType, 'none'>;

export const kickerHistoryAlertTypes = historyAlertTypeSchema.options.filter(
	(alertType): alertType is KickerHistoryAlertType => alertType !== 'none',
);

export const canonicalHistoryAlertTypes = <Type extends string>(
	alertTypes: readonly Type[],
): Type[] => [...new Set(alertTypes)].sort();
