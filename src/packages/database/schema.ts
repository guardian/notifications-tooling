import { relations } from 'drizzle-orm';
import {
	boolean,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';

export const notificationKindEnum = pgEnum('notification_kind', [
	'send',
	'test',
]);

export const notificationStatusEnum = pgEnum('notification_status', [
	'accepted',
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
	'newsletter',
	'app-push',
]);

export const dispatchStatusEnum = pgEnum('dispatch_status', [
	'success',
	'failure',
]);

/**
 * The validated `content.items` map and the `channels` (audience + compose)
 * object are stored verbatim rather than normalised. Typed loosely here so
 * `@database` stays decoupled from the backend's zod request contract, which
 * owns their shape.
 */
type ContentItemsJson = Record<string, unknown>;
type ChannelsJson = Record<string, unknown>;

export const notifications = pgTable(
	'notifications',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		idempotencyKey: text('idempotency_key').notNull(),
		kind: notificationKindEnum('kind').notNull(),
		status: notificationStatusEnum('status').notNull().default('accepted'),
		sender: text('sender').notNull(),
		dryRun: boolean('dry_run').notNull().default(false),
		scheduledFor: timestamp('scheduled_for', {
			withTimezone: true,
			mode: 'date',
		}),
		content: jsonb('content').$type<ContentItemsJson>().notNull(),
		channels: jsonb('channels').$type<ChannelsJson>().notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'date',
		})
			.notNull()
			.defaultNow(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'date',
		})
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex('notifications_idempotency_key_unique').on(
			table.idempotencyKey,
		),
	],
);

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
	},
	(table) => [
		// One row per (notification, channel, target); a retry upserts it.
		uniqueIndex(
			'notification_dispatches_notification_channel_target_unique',
		).on(table.notificationId, table.channel, table.target),
	],
);

export const notificationsRelations = relations(notifications, ({ many }) => ({
	dispatches: many(notificationDispatches),
}));

export const notificationDispatchesRelations = relations(
	notificationDispatches,
	({ one }) => ({
		notification: one(notifications, {
			fields: [notificationDispatches.notificationId],
			references: [notifications.id],
		}),
	}),
);
