export { getDb } from './client';
export type {
	DispatchRequested,
	DispatchResolved,
} from './schema/notification-dispatches';
export type { FailedTargets } from './schema/notifications';
export {
	createNotificationDispatchesRepository,
	type NewNotificationDispatch,
	type NotificationDispatch,
	type NotificationDispatchesRepository,
} from './repositories/notification-dispatches-repository';
export {
	createNotificationsRepository,
	type ListNotificationsInWindowOptions,
	DuplicateIdempotencyKeyError,
	type ListRecentNotificationsOptions,
	type NewNotification,
	type Notification,
	type NotificationListPage,
	type NotificationsRepository,
	type NotificationWithDispatches,
} from './repositories/notifications-repository';
