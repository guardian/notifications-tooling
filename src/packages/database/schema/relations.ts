import { relations } from 'drizzle-orm';
import { notificationDispatches } from './notification-dispatches';
import { notifications } from './notifications';

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
