import {
	createNotificationsRepository,
	getDb,
	type Notification,
	type NotificationWithDispatches,
} from '@database';
import { UserPermissions } from '@models';
import { type Request, type Response, Router } from 'express';
import validate, { type ErrorRequestHandler } from 'express-zod-safe';
import { buildErrorEnvelope } from '../../error-envelope';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import {
	type GrafanaQueryRequest,
	grafanaQueryRequestSchema,
} from './grafana-query-request';

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

// Bounds an all-time Grafana query so it can't exhaust the database or memory.
const maxRangeMs = 90 * 24 * 60 * 60 * 1000;
const maxNotifications = 5000;

/**
 * express-zod-safe error hook for `POST /grafana/query`. A failing `targets`
 * issue means the metric is unsupported; anything else is a malformed range.
 */
export const handleGrafanaQueryValidationError: ErrorRequestHandler = (
	errors,
	req,
	res,
) => {
	const failsTargetCheck = errors.some((item) =>
		item.errors.issues.some((issue) => issue.path[0] === 'targets'),
	);

	res
		.status(400)
		.json(
			buildErrorEnvelope(
				req,
				failsTargetCheck ? 'unsupported_metric' : 'invalid_query',
				failsTargetCheck
					? "The supported metric is 'notifications'."
					: 'Grafana query range.from and range.to are required dates.',
			),
		);
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
	// express-zod-safe has already validated the body against the schema.
	const { range } = req.body as GrafanaQueryRequest;
	const from = new Date(range.from);
	const to = new Date(range.to);

	if (to.getTime() - from.getTime() > maxRangeMs) {
		res
			.status(400)
			.json(
				buildErrorEnvelope(
					req,
					'range_too_large',
					'Grafana query range must not exceed 90 days.',
				),
			);
		return;
	}

	const notifications = await createNotificationsRepository(
		await getDb(),
	).listSendsWithDispatchesInWindow({
		from,
		to,
		limit: maxNotifications + 1,
	});

	// Hitting the cap means older matches were dropped; surface a Grafana
	// notice (rendered as a panel warning icon) rather than a silent gap.
	const meta =
		notifications.length > maxNotifications
			? {
					notices: [
						{
							severity: 'warning' as const,
							text: `Showing the latest ${maxNotifications} notifications; narrow the query range to see all results.`,
						},
					],
				}
			: undefined;

	res.json([
		{
			type: 'table',
			columns: grafanaTableColumns,
			rows: toGrafanaRows(notifications),
			...(meta ? { meta } : {}),
		},
	]);
};

export const grafanaRouter = Router()
	.post('/metrics', ...grafanaAccessMiddleware, grafanaMetricsHandler)
	.post(
		'/query',
		...grafanaAccessMiddleware,
		validate({
			body: grafanaQueryRequestSchema,
			handler: handleGrafanaQueryValidationError,
		}),
		grafanaQueryHandler,
	);
