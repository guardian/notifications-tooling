import {
	boolean,
	index,
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
	// Request stored, not yet dispatched (or dry-run / scheduled).
	'accepted',
	// Rolled up from the dispatch outcomes once delivery settles.
	'delivered', // every target succeeded
	'partially_delivered', // at least one target failed and at least one succeeded
	'failed', // every target failed
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
		// The pan-domain-authenticated user's email, resolved from the Panda
		// cookie by authMiddleware. Panda exposes email as the stable user id.
		createdByEmail: text('created_by_email').notNull(),
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
		// Serves the list endpoint's 14-day window filter + newest-first order.
		index('notifications_created_at_idx').on(table.createdAt.desc()),
	],
);
