import { notificationSchema } from './notification';

const { dispatches, ...summaryProperties } = notificationSchema.properties;
void dispatches;

/**
 * A persisted notification without its dispatch outcomes, as returned by the
 * list endpoint `GET /v1/notifications`. Referenced via
 * `#/components/schemas/NotificationSummary`.
 */
export const notificationSummarySchema = {
	type: 'object',
	description: 'A persisted notification without its dispatch outcomes.',
	required: notificationSchema.required.filter(
		(field) => field !== 'dispatches',
	),
	properties: summaryProperties,
} as const;
