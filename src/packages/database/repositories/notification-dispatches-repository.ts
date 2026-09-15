import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { notificationDispatches } from '../schema';

export type NotificationDispatch = typeof notificationDispatches.$inferSelect;
export type NewNotificationDispatch =
	typeof notificationDispatches.$inferInsert;

export const createNotificationDispatchesRepository = (db: Database) => ({
	async findByNotificationId(
		notificationId: string,
	): Promise<NotificationDispatch[]> {
		return db
			.select()
			.from(notificationDispatches)
			.where(eq(notificationDispatches.notificationId, notificationId));
	},

	/**
	 * Records a dispatch outcome, upserting on the (notification, requested)
	 * unique key so a retry overwrites that target's prior outcome.
	 */
	async upsert(values: NewNotificationDispatch): Promise<NotificationDispatch> {
		const [row] = await db
			.insert(notificationDispatches)
			.values(values)
			.onConflictDoUpdate({
				target: [
					notificationDispatches.notificationId,
					notificationDispatches.requested,
				],
				set: {
					resolved: values.resolved,
					providerRef: values.providerRef ?? null,
					status: values.status,
					failureReason: values.failureReason ?? null,
					providerStatusCode: values.providerStatusCode ?? null,
					updatedAt: new Date(),
				},
			})
			.returning();

		return row!;
	},
});

export type NotificationDispatchesRepository = ReturnType<
	typeof createNotificationDispatchesRepository
>;
