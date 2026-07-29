import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const notificationStatusEnum = pgEnum('notification_status', [
  'accepted',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    idempotencyKey: text('idempotency_key').notNull(),
    status: notificationStatusEnum('status')
      .notNull()
      .default('accepted'),
    sender: text('sender').notNull(),
    dryRun: boolean('dry_run')
      .notNull()
      .default(false),
    scheduledFor: timestamp('scheduled_for', {
      withTimezone: true,
      mode: 'date',
    }),
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