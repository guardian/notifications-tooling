import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { useState } from 'react';
import { useNotificationDetail } from '../hooks/useNotificationDetail';
import type { NotificationResource } from '../schemas';
import { historyViewStyles } from '../themes';
import { Tooltip } from '../ui/Tooltip';
import type { HistoryNotification } from './HistoryView';

const channelNames = {
	'app-push': 'app alert',
	newsletter: 'newsletter email',
} as const;

const failureReasonDescriptions: Record<string, string> = {
	http_error: 'The downstream service rejected the request.',
	timeout: 'The downstream service did not respond in time.',
	network_error: 'The downstream service could not be reached.',
	invalid_response: 'The downstream service returned an unexpected response.',
	unknown: 'The downstream service reported an unexpected problem.',
};

const destinationName = (
	dispatch: NotificationResource['dispatches'][number],
) =>
	dispatch.requested.channel === 'app-push'
		? `${dispatch.requested.topicType}: ${dispatch.requested.editions.join(', ')}`
		: dispatch.requested.segment;

const summarizeFailure = (notification: NotificationResource) => {
	const failedDispatches = notification.dispatches.filter(
		({ status }) => status === 'failure',
	);
	const channels = [
		...new Set(failedDispatches.map(({ channel }) => channelNames[channel])),
	];
	const destinations = failedDispatches.map(destinationName);
	const reasons = [
		...new Set(
			failedDispatches.map(
				({ failureReason }) =>
					failureReasonDescriptions[failureReason ?? 'unknown'] ??
					failureReasonDescriptions.unknown,
			),
		),
	];
	const statusCodes = [
		...new Set(
			failedDispatches.flatMap(({ providerStatusCode }) =>
				providerStatusCode === null ? [] : [providerStatusCode],
			),
		),
	];

	return {
		channels,
		destinations,
		reasons,
		statusCodes,
	};
};

const FailureTooltipContent = ({
	notification,
	isLoading,
	isError,
}: {
	notification?: NotificationResource;
	isLoading: boolean;
	isError: boolean;
}) => {
	if (isLoading) {
		return <>Loading failure details...</>;
	}
	if (isError || !notification) {
		return <>Failure details could not be loaded.</>;
	}

	const summary = summarizeFailure(notification);
	return (
		<>
			Couldn&apos;t send to{' '}
			{summary.destinations.join('; ') || 'the destination'}
			{summary.channels.length > 0 ? ` via ${summary.channels.join(', ')}` : ''}
			. {summary.reasons.join(' ')}
			{summary.statusCodes.length > 0
				? ` Provider status: ${summary.statusCodes.join(', ')}.`
				: ''}
			{' Please contact Central Production for support.'}
		</>
	);
};

export const HistoryFailureTooltip = ({
	notification,
}: {
	notification: HistoryNotification;
}) => {
	const [hasOpened, setHasOpened] = useState(false);
	const notificationDetail = useNotificationDetail(
		hasOpened ? notification.id : undefined,
	);
	const isPartialFailure = notification.status === 'Partially sent';

	return (
		<Tooltip
			label={`${notification.status}: Show failure details for ${notification.title}`}
			placement="left"
			trigger={
				<Badge
					color={isPartialFailure ? 'yellow' : 'red'}
					size="xs"
					weight="strong"
					cssOverrides={historyViewStyles.statusBadge}
				>
					{notification.status}
				</Badge>
			}
			onOpenChange={(isOpen) => isOpen && setHasOpened(true)}
			theme={{
				color: semanticColors.text.strongerInverse,
				backgroundColor: semanticColors.fill.strong,
			}}
			cssOverrides={css({
				maxWidth: '30rem',
				padding: semanticSpacing.stackSm,
			})}
		>
			<strong>{isPartialFailure ? 'Partial failure: ' : 'Failure: '}</strong>
			<FailureTooltipContent
				notification={notificationDetail.data}
				isLoading={notificationDetail.isPending}
				isError={notificationDetail.isError}
			/>
		</Tooltip>
	);
};
