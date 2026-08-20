import {
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
		// topicType (app-push) or segmentId (newsletter): the unit one call addresses.
		target: text('target').notNull(),
		// mobile-n10n POST id or Braze dispatchId.
		providerRef: text('provider_ref'),
		status: dispatchStatusEnum('status').notNull(),
		failureReason: text('failure_reason'),
		// Channel-specific extras (e.g. campaignId, importance, editions).
		detail: jsonb('detail'),
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
		// One row per (notification, channel, target); a retry upserts it.
		uniqueIndex(
			'notification_dispatches_notification_channel_target_unique',
		).on(table.notificationId, table.channel, table.target),
	],
);
