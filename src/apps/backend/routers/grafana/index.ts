import {
	createNotificationsRepository,
	getDb,
	type NotificationWithDispatches,
} from '@database';
import { UserPermissions } from '@models';
import { type Request, type Response, Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';

const grafanaAccessMiddleware = [
	authMiddleware,
	requirePermissions([UserPermissions.DispatchAccess]),
];

export const grafanaMetricsHandler = (_req: Request, res: Response) => {
	res.json([{ label: 'Notifications', value: 'notifications' }]);
};

const grafanaTableColumns = [
	{ text: 'Sent At', type: 'time' },
	{ text: 'Notification ID', type: 'string' },
	{ text: 'Channel', type: 'string' },
	{ text: 'Created By', type: 'string' },
	{ text: 'Notification Status', type: 'string' },
	{ text: 'Dispatch Status', type: 'string' },
	{ text: 'Provider Status Code', type: 'number' },
	{ text: 'Error', type: 'string' },
] as const;

type GrafanaQueryBody = {
	range?: { from?: string; to?: string };
	targets?: Array<{ target?: unknown }>;
};

// Bounds an all-time Grafana query so it can't exhaust the database or memory.
const maxRangeMs = 90 * 24 * 60 * 60 * 1000;
const maxNotifications = 5000;

const hasNotificationsTarget = (body: GrafanaQueryBody | null | undefined) =>
	body?.targets?.length === 1 && body.targets[0]?.target === 'notifications';

const getDateRange = (body: GrafanaQueryBody) => {
	const from = body.range?.from ? new Date(body.range.from) : null;
	const to = body.range?.to ? new Date(body.range.to) : null;

	return from &&
		to &&
		!Number.isNaN(from.getTime()) &&
		!Number.isNaN(to.getTime()) &&
		from.getTime() <= to.getTime()
		? { from, to }
		: null;
};

const toGrafanaRows = (notifications: NotificationWithDispatches[]) =>
	notifications.flatMap((notification) => {
		const dispatches = notification.dispatches.length
			? notification.dispatches
			: [null];

		return dispatches.map((dispatch) => [
			notification.createdAt.getTime(),
			notification.id,
			dispatch?.channel ?? null,
			notification.createdByEmail,
			notification.status,
			dispatch?.status ?? null,
			dispatch?.providerStatusCode ?? null,
			dispatch?.failureReason ?? null,
		]);
	});

export const grafanaQueryHandler = async (req: Request, res: Response) => {
	const body = req.body as GrafanaQueryBody;
	if (!hasNotificationsTarget(body)) {
		res.status(400).json({
			error: 'unsupported_metric',
			message: "The supported metric is 'notifications'.",
		});
		return;
	}

	const dateRange = getDateRange(body);
	if (!dateRange) {
		res.status(400).json({
			error: 'invalid_query',
			message: 'Grafana query range.from and range.to are required dates.',
		});
		return;
	}

	if (dateRange.to.getTime() - dateRange.from.getTime() > maxRangeMs) {
		res.status(400).json({
			error: 'range_too_large',
			message: 'Grafana query range must not exceed 90 days.',
		});
		return;
	}

	const notifications = await createNotificationsRepository(
		await getDb(),
	).listRecentWithDispatches({
		from: dateRange.from,
		to: dateRange.to,
		limit: maxNotifications,
	});

	res.json([
		{
			type: 'table',
			columns: grafanaTableColumns,
			rows: toGrafanaRows(notifications),
		},
	]);
};

export const grafanaRouter = Router()
	.post('/metrics', ...grafanaAccessMiddleware, grafanaMetricsHandler)
	.post('/query', ...grafanaAccessMiddleware, grafanaQueryHandler);
