import {
	createNotificationsRepository,
	getDb,
	type Notification,
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
	{ text: 'Failed Audiences', type: 'string' },
	{ text: 'Errors', type: 'string' },
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

const formatChannels = (channels: Notification['channels']) =>
	Object.keys(channels).join(', ') || null;

const formatAudience = (
	requested: NotificationWithDispatches['dispatches'][number]['requested'],
) =>
	requested.channel === 'app-push'
		? `${requested.topicType} [${requested.editions.join(', ')}]`
		: requested.segment;

const formatFailedAudiences = (
	failedTargets: Notification['failedTargets'],
) => {
	const failures = [
		...failedTargets.topics.map(
			({ topicType, edition }) => `${topicType} [${edition}]`,
		),
		...failedTargets.segments.map(({ segmentId }) => segmentId),
	];
	return failures.length ? failures.join(', ') : null;
};

const formatErrors = (dispatches: NotificationWithDispatches['dispatches']) => {
	const errors = dispatches
		.filter((dispatch) => dispatch.status === 'failure')
		.map((dispatch) => {
			const audience = formatAudience(dispatch.requested);
			const reason = dispatch.failureReason ?? 'unknown';
			return dispatch.providerStatusCode !== null
				? `${audience}: ${reason} (${dispatch.providerStatusCode})`
				: `${audience}: ${reason}`;
		});
	return errors.length ? errors.join('; ') : null;
};

const toGrafanaRows = (notifications: NotificationWithDispatches[]) =>
	notifications.map((notification) => [
		notification.createdAt.getTime(),
		notification.id,
		formatChannels(notification.channels),
		notification.createdByEmail,
		notification.status,
		formatFailedAudiences(notification.failedTargets),
		formatErrors(notification.dispatches),
	]);

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
	).listSendsWithDispatchesInWindow({
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
