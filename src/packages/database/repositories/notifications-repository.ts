import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { notifications } from '../schema';
import type { NotificationDispatch } from './notification-dispatches-repository';

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type NotificationWithDispatches = Notification & {
	dispatches: NotificationDispatch[];
};

export const createNotificationsRepository = (db: Database) => ({
	async create(values: NewNotification): Promise<Notification> {
		const [row] = await db.insert(notifications).values(values).returning();
		return row!;
	},

	async findById(id: string): Promise<Notification | null> {
		const [row] = await db
			.select()
			.from(notifications)
			.where(eq(notifications.id, id))
			.limit(1);

		return row ?? null;
	},

	/** The notification plus its dispatch outcomes, oldest first, or null. */
	async findByIdWithDispatches(
		id: string,
	): Promise<NotificationWithDispatches | null> {
		const row = await db.query.notifications.findFirst({
			where: eq(notifications.id, id),
			with: {
				dispatches: {
					orderBy: (dispatch, { asc }) => [asc(dispatch.createdAt)],
				},
			},
		});

		return row ?? null;
	},
});

export type NotificationsRepository = ReturnType<
	typeof createNotificationsRepository
>;
