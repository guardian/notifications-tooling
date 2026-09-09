import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import type { Database } from '../client';
import { notifications } from '../schema';
import type { FailedTargets } from '../schema/notifications';
import type { NotificationDispatch } from './notification-dispatches-repository';

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type NotificationWithDispatches = Notification & {
	dispatches: NotificationDispatch[];
};

/** Pagination plus the caller-supplied cut-off for {@link NotificationsRepository.listRecent}. */
export type ListRecentNotificationsOptions = {
	/** Only notifications created at or after this instant are returned. */
	since: Date;
	limit?: number;
	offset?: number;
};

export type ListNotificationsInWindowOptions = {
	from: Date;
	to: Date;
	/** Caps the notifications loaded so an unbounded range can't exhaust memory. */
	limit: number;
};

export type NotificationListPage = {
	notifications: Notification[];
	/** Rows created at or after `since`, independent of any limit/offset page. */
	total: number;
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

	/**
	 * Records the rolled-up status and the failed targets together once the
	 * dispatch outcomes settle, so the list endpoint can report failures without
	 * joining the dispatches.
	 */
	async updateDeliveryOutcome(
		id: string,
		{
			status,
			failedTargets,
		}: { status: Notification['status']; failedTargets: FailedTargets },
	): Promise<Notification> {
		const [row] = await db
			.update(notifications)
			.set({ status, failedTargets, updatedAt: new Date() })
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
	 * The production sends (`kind = 'send'`) created at or after `since`, newest
	 * first. Test notifications are excluded. `total` counts every matching row
	 * within that cut-off, ignoring the limit/offset page. Dispatch outcomes are
	 * intentionally not joined here.
	 */
	async listRecent({
		since,
		limit,
		offset,
	}: ListRecentNotificationsOptions): Promise<NotificationListPage> {
		const withinWindow = and(
			gte(notifications.createdAt, since),
			eq(notifications.kind, 'send'),
		);

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

	/** Production sends in a time window with their provider outcomes attached. */
	async listRecentWithDispatches({
		from,
		to,
		limit,
	}: ListNotificationsInWindowOptions): Promise<NotificationWithDispatches[]> {
		return db.query.notifications.findMany({
			where: and(
				gte(notifications.createdAt, from),
				lte(notifications.createdAt, to),
				eq(notifications.kind, 'send'),
				eq(notifications.dryRun, false),
			),
			orderBy: (notification, { desc: orderDescending }) => [
				orderDescending(notification.createdAt),
			],
			limit,
			with: {
				dispatches: {
					orderBy: (dispatch, { asc }) => [asc(dispatch.createdAt)],
				},
			},
		});
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
