import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { notificationChannelNames } from '@models';
import { useState } from 'react';
import { useNotificationDetail } from '../hooks/useNotificationDetail';
import type { ChannelAudienceResponse, NotificationResource } from '../schemas';
import { historyViewStyles } from '../themes';
import { Tooltip } from '../ui/Tooltip';
import { formatDispatchTarget } from '../utils/format-dispatch-target';
import type { HistoryNotification } from './HistoryView';

const failureReasonDescriptions: Record<string, string> = {
	http_error: 'The downstream service rejected the request.',
	timeout: 'The downstream service did not respond in time.',
	network_error: 'The downstream service could not be reached.',
	invalid_response: 'The downstream service returned an unexpected response.',
	unknown: 'An unexpected problem occurred while sending.',
};

const failureListStyles = css({
	margin: `${semanticSpacing.stackXs} 0`,
	paddingLeft: semanticSpacing.stackLg,
	li: {
		marginBottom: semanticSpacing.stackXs,
	},
	'li:last-child': {
		marginBottom: 0,
	},
});

const FailureTooltipContent = ({
	notification,
	audiences,
	isLoading,
	isError,
}: {
	notification?: NotificationResource;
	audiences?: ChannelAudienceResponse;
	isLoading: boolean;
	isError: boolean;
}) => {
	if (isLoading) {
		return <>Loading failure details...</>;
	}
	if (isError || !notification) {
		return <>Failure details could not be loaded.</>;
	}

	const failedDispatches = notification.dispatches.filter(
		({ status }) => status === 'failure',
	);

	if (failedDispatches.length === 0) {
		return <>No per-destination failure details are available.</>;
	}

	return (
		<>
			Couldn&apos;t send to:
			<ul css={failureListStyles}>
				{failedDispatches.map((dispatch) => {
					const reason =
						failureReasonDescriptions[dispatch.failureReason ?? 'unknown'] ??
						failureReasonDescriptions.unknown;

					return (
						<li key={dispatch.id}>
							<strong>
								{formatDispatchTarget(dispatch.requested, audiences)}
							</strong>{' '}
							via {notificationChannelNames[dispatch.channel].toLowerCase()}.{' '}
							{reason}
							{dispatch.providerStatusCode !== null
								? ` Provider status: ${dispatch.providerStatusCode}.`
								: ''}
						</li>
					);
				})}
			</ul>
			Please contact Central Production for support.
		</>
	);
};

export const HistoryFailureTooltip = ({
	notification,
	audiences,
}: {
	notification: HistoryNotification;
	audiences?: ChannelAudienceResponse;
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
				audiences={audiences}
				isLoading={notificationDetail.isPending}
				isError={notificationDetail.isError}
			/>
		</Tooltip>
	);
};
