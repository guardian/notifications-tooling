import {
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { notifications } from './notifications';

export const notificationChannelEnum = pgEnum('notification_channel', [
	'newsletter',
	'app-push',
]);

export const dispatchStatusEnum = pgEnum('dispatch_status', [
	'success',
	'failure',
]);

/**
 * What the API consumer asked for: the audience unit addressed by one call.
 * Discriminated by channel so it is self-describing when read back.
 */
export type DispatchRequested =
	| { channel: 'app-push'; topicType: string; editions: string[] }
	| { channel: 'newsletter'; segment: string };

/**
 * What the request resolved to downstream: the actual values sent to the
 * provider (not the consumer's mapping keys), kept beside `requested` so it is
 * always clear what came in and what it mapped to.
 */
export type DispatchResolved =
	| {
			channel: 'app-push';
			topics: Array<{ type: string; name: string }>;
			importance: 'Major' | 'Minor';
	  }
	| {
			channel: 'newsletter';
			brazeCampaignId?: string;
			emailRenderingId: string;
	  };

/**
 * One downstream provider call: one mobile-n10n push per app-push topic type,
 * one Braze campaign per newsletter segment. Persisted from the dispatch
 * outcomes so a re-send can skip targets that already succeeded.
 */
export const notificationDispatches = pgTable(
	'notification_dispatches',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		notificationId: uuid('notification_id')
			.notNull()
			.references(() => notifications.id, { onDelete: 'cascade' }),
		channel: notificationChannelEnum('channel').notNull(),
		// The consumer's audience unit: app-push `{ topicType, editions }` or
		// newsletter `{ segment }`.
		requested: jsonb('requested').$type<DispatchRequested>().notNull(),
		// The final values sent downstream: app-push `{ topics, importance }` or
		// newsletter `{ brazeCampaignId?, emailRenderingId }`.
		resolved: jsonb('resolved').$type<DispatchResolved>().notNull(),
		// mobile-n10n POST id or Braze dispatchId.
		providerRef: text('provider_ref'),
		status: dispatchStatusEnum('status').notNull(),
		failureReason: text('failure_reason'),
		// The external service's HTTP status when a failed call reached the
		// provider (null for timeouts, network errors, or a success).
		providerStatusCode: integer('provider_status_code'),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'date',
		})
			.notNull()
			.defaultNow(),
		// Bumped when a retry upserts this target's outcome.
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'date',
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		// One row per requested target within a notification; `requested` fully
		// identifies the target, so a retry upserts the same row.
		uniqueIndex('notification_dispatches_notification_requested_unique').on(
			table.notificationId,
			table.requested,
		),
	],
);
