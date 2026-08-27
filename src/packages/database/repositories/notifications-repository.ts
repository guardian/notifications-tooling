import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { notifications } from '../schema';
import type { NotificationDispatch } from './notification-dispatches-repository';

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type NotificationWithDispatches = Notification & {
	dispatches: NotificationDispatch[];
};

/** Thrown when a create hits the `idempotency_key` unique index. */
export class DuplicateIdempotencyKeyError extends Error {
	constructor(public readonly idempotencyKey: string) {
		super(
			`A notification with idempotencyKey '${idempotencyKey}' already exists.`,
		);
		this.name = 'DuplicateIdempotencyKeyError';
	}
}

/** Postgres `unique_violation` SQLSTATE and the idempotency-key index name. */
const uniqueViolationCode = '23505';
const idempotencyKeyConstraint = 'notifications_idempotency_key_unique';

/** Drizzle wraps driver errors, so walk the `cause` chain to find the pg error. */
const isIdempotencyKeyViolation = (error: unknown): boolean => {
	for (let cursor = error; cursor != null;) {
		if (
			typeof cursor === 'object' &&
			(cursor as { code?: unknown }).code === uniqueViolationCode &&
			(cursor as { constraint?: unknown }).constraint ===
				idempotencyKeyConstraint
		) {
			return true;
		}

		cursor = cursor instanceof Error ? (cursor.cause ?? null) : null;
	}

	return false;
};

export const createNotificationsRepository = (db: Database) => ({
	async create(values: NewNotification): Promise<Notification> {
		try {
			const [row] = await db.insert(notifications).values(values).returning();
			return row!;
		} catch (error) {
			if (isIdempotencyKeyViolation(error)) {
				throw new DuplicateIdempotencyKeyError(values.idempotencyKey);
			}
			throw error;
		}
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
