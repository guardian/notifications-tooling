import { count, desc, eq, gte } from 'drizzle-orm';
import type { Database } from '../client';
import { notifications } from '../schema';
import type { NotificationDispatch } from './notification-dispatches-repository';

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type NotificationWithDispatches = Notification & {
	dispatches: NotificationDispatch[];
};

/** Notifications older than this window are excluded from the list endpoint. */
const recentNotificationWindowDays = 14;

/** Optional pagination for {@link NotificationsRepository.listRecent}. */
export type ListRecentNotificationsOptions = {
	limit?: number;
	offset?: number;
};

export type NotificationListPage = {
	notifications: Notification[];
	/** Rows within the 14-day window, independent of any limit/offset page. */
	total: number;
};

export const createNotificationsRepository = (db: Database) => ({
	async create(values: NewNotification): Promise<Notification> {
		const [row] = await db.insert(notifications).values(values).returning();
		return row!;
	},

	/** Sets the rolled-up delivery status once the dispatch outcomes settle. */
	async updateStatus(
		id: string,
		status: Notification['status'],
	): Promise<Notification> {
		const [row] = await db
			.update(notifications)
			.set({ status, updatedAt: new Date() })
			.where(eq(notifications.id, id))
			.returning();

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

	/**
	 * The notifications created within the last 14 days, newest first. `total`
	 * counts every row within that window, ignoring the limit/offset page.
	 * Dispatch outcomes are intentionally not joined here.
	 */
	async listRecent({
		limit,
		offset,
	}: ListRecentNotificationsOptions = {}): Promise<NotificationListPage> {
		const createdSince = new Date(
			Date.now() - recentNotificationWindowDays * 24 * 60 * 60 * 1000,
		);
		const withinWindow = gte(notifications.createdAt, createdSince);

		const [totals] = await db
			.select({ total: count() })
			.from(notifications)
			.where(withinWindow);

		let pageQuery = db
			.select()
			.from(notifications)
			.where(withinWindow)
			.orderBy(desc(notifications.createdAt))
			.$dynamic();

		if (limit !== undefined) {
			pageQuery = pageQuery.limit(limit);
		}
		if (offset !== undefined) {
			pageQuery = pageQuery.offset(offset);
		}

		return { notifications: await pageQuery, total: totals?.total ?? 0 };
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
