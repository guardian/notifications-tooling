import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Typography } from '@guardian/stand/Typography';
import type { NotificationResource } from '../schemas';
import type { HistoryNotification } from './HistoryView';

const channelNames = {
	'app-push': 'App alert',
	newsletter: 'Newsletter email',
} as const;

const failureReasonDescriptions: Record<string, string> = {
	http_error: 'The delivery service rejected the request.',
	timeout: 'The delivery service did not respond in time.',
	network_error: 'The delivery service could not be reached.',
	invalid_response: 'The delivery service returned an unexpected response.',
	unknown: 'The delivery service reported an unexpected problem.',
};

export const summarizeFailure = (notification: NotificationResource) => {
	const failedDispatches = notification.dispatches.filter(
		({ status }) => status === 'failure',
	);
	const failedChannels = [
		...new Set(failedDispatches.map(({ channel }) => channelNames[channel])),
	];
	const failedDestinations = failedDispatches.map(({ requested }) =>
		requested.channel === 'app-push'
			? `${requested.topicType}: ${requested.editions.join(', ')}`
			: requested.segment,
	);
	const failureReasons = [
		...new Set(
			failedDispatches.map(
				({ failureReason }) =>
					failureReasonDescriptions[failureReason ?? 'unknown'] ??
					failureReasonDescriptions.unknown,
			),
		),
	];
	const anyRecipientsReceived = notification.dispatches.some(
		({ status }) => status === 'success',
	);

	return {
		failedChannels,
		failedDestinations,
		failureReasons,
		anyRecipientsReceived,
	};
};

interface HistoryFailureDetailProps {
	selected: HistoryNotification;
	notification?: NotificationResource;
	isLoading: boolean;
	isError: boolean;
	onClose: () => void;
	onResolve: () => void;
}

export const HistoryFailureDetail = ({
	selected,
	notification,
	isLoading,
	isError,
	onClose,
	onResolve,
}: HistoryFailureDetailProps) => {
	const summary = notification ? summarizeFailure(notification) : undefined;

	return (
		<Modal isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
			<Dialog aria-label={`Failure details for ${selected.title}`}>
				<Dialog.Dismiss ariaLabel="Close failure details" />
				<Dialog.Header>
					<InlineMessage level="error">
						<Typography
							element="h2"
							variant="headingLg"
							theme={{ color: semanticColors.text.error }}
						>
							{selected.title} failed to send
						</Typography>
					</InlineMessage>
				</Dialog.Header>
				<Dialog.Content>
					<div
						css={{
							display: 'flex',
							flexDirection: 'column',
							gap: semanticSpacing.stackSm,
						}}
					>
						{isLoading && <Typography>Loading failure details...</Typography>}
						{isError && (
							<Typography>Failure details could not be loaded.</Typography>
						)}
						{summary && (
							<>
								<Typography>
									Failed channel{summary.failedChannels.length === 1 ? '' : 's'}
									: {summary.failedChannels.join(', ') || 'Unknown'}
								</Typography>
								<Typography>
									Affected destination
									{summary.failedDestinations.length === 1 ? '' : 's'}:{' '}
									{summary.failedDestinations.join('; ') || 'Unknown'}
								</Typography>
								<Typography>
									{summary.anyRecipientsReceived
										? 'Some recipients received the notification; delivery failed for others.'
										: 'No recipients were confirmed to have received the notification.'}
								</Typography>
								{summary.failureReasons.map((reason) => (
									<Typography key={reason}>{reason}</Typography>
								))}
								<Typography variant="bodySm">
									Sent by {selected.sentBy}. Reference: {selected.id}
								</Typography>
							</>
						)}
					</div>
				</Dialog.Content>
				<Dialog.Buttons>
					<Button onPress={onResolve}>
						Create another{' '}
						{selected.channel === 'push' ? 'app alert' : 'newsletter email'}
					</Button>
				</Dialog.Buttons>
			</Dialog>
		</Modal>
	);
};
