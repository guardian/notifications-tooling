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

export const summarizeFailure = (notification: NotificationResource) => {
	const failedDispatches = notification.dispatches.filter(
		({ status }) => status === 'failure',
	);
	const failedChannels = [
		...new Set(failedDispatches.map(({ channel }) => channelNames[channel])),
	];
	const failedDestinations = failedDispatches.map(destinationName);
	const failureReasons = [
		...new Set(
			failedDispatches.map(
				({ failureReason }) =>
					failureReasonDescriptions[failureReason ?? 'unknown'] ??
					failureReasonDescriptions.unknown,
			),
		),
	];
	const acceptedDispatches = notification.dispatches.filter(
		({ status }) => status === 'success',
	);
	const acceptedProviderReferences = acceptedDispatches.flatMap((dispatch) =>
		dispatch.providerRef
			? [`${destinationName(dispatch)}: ${dispatch.providerRef}`]
			: [],
	);
	const failureStatusCodes = [
		...new Set(
			failedDispatches.flatMap(({ providerStatusCode }) =>
				providerStatusCode === null ? [] : [providerStatusCode],
			),
		),
	];

	return {
		failedChannels,
		failedDestinations,
		failureReasons,
		hasAcceptedDestinations: acceptedDispatches.length > 0,
		acceptedProviderReferences,
		failureStatusCodes,
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
	const isPartialFailure = selected.status === 'Partially sent';

	return (
		<Modal isOpen onOpenChange={(isOpen) => !isOpen && onClose()}>
			<Dialog aria-label={`Dispatch details for ${selected.title}`}>
				<Dialog.Dismiss ariaLabel="Close failure details" />
				<Dialog.Header>
					<InlineMessage level="error">
						<Typography
							element="h2"
							variant="headingLg"
							theme={{ color: semanticColors.text.error }}
						>
							{isPartialFailure
								? `${selected.title} was only partly accepted`
								: `${selected.title} was not accepted`}
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
									{summary.hasAcceptedDestinations
										? 'The downstream service accepted some destination requests and rejected others.'
										: 'The downstream service rejected every destination request.'}
								</Typography>
								{summary.failureReasons.map((reason) => (
									<Typography key={reason}>{reason}</Typography>
								))}
								{summary.failureStatusCodes.length > 0 && (
									<Typography>
										Provider status code
										{summary.failureStatusCodes.length === 1 ? '' : 's'}:{' '}
										{summary.failureStatusCodes.join(', ')}
									</Typography>
								)}
								{summary.acceptedProviderReferences.length > 0 && (
									<Typography variant="bodySm">
										Accepted provider reference
										{summary.acceptedProviderReferences.length === 1 ? '' : 's'}
										: {summary.acceptedProviderReferences.join('; ')}
									</Typography>
								)}
								<Typography variant="bodySm">
									Acceptance confirms that the downstream service queued the
									request. It does not confirm delivery to individual
									recipients.
								</Typography>
								<Typography variant="bodySm">
									Sent by {selected.sentBy}. Tooling reference: {selected.id}
								</Typography>
							</>
						)}
					</div>
				</Dialog.Content>
				<Dialog.Buttons>
					<Button onPress={onResolve}>
						Create another{' '}
						{selected.channel === 'app-push' ? 'app alert' : 'newsletter email'}
					</Button>
				</Dialog.Buttons>
			</Dialog>
		</Modal>
	);
};
