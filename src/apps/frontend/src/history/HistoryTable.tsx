import { Badge } from '@guardian/stand/Badge';
import { Icon } from '@guardian/stand/Icon';
import { Link } from '@guardian/stand/Link';
import {
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import type { DisplayAppAlertTopicEditionId } from '@models';
import { useRelativeTime } from '../hooks/use-relative-time';
import { historyViewStyles } from '../themes';
import { FlagAtom } from '../ui/FlagAtom';
import { phoneIphoneIcon } from '../ui/FlagIcons';
import { SendTimeTooltip } from '../ui/SendTimeTooltip';
import type { HistoryNotification, HistoryStatus } from './HistoryView';

interface HistoryTableProps {
	notifications?: HistoryNotification[];
}

const tableColumns = {
	sm: 'minmax(0, 1fr)',
	md: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
	lg: 'minmax(280px, 2.4fr) minmax(180px, 1.2fr) minmax(150px, 1fr) minmax(160px, 1fr) 132px',
} as const;

const getChannelName = (channel: HistoryNotification['channel']) =>
	channel === 'push' ? 'App alert' : 'Newsletter email';

const editionNames: Record<DisplayAppAlertTopicEditionId, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
	EU: 'Europe',
	INT: 'International',
};

const statusColors: Record<HistoryStatus, 'green' | 'yellow' | 'grey' | 'red'> =
	{
		Accepted: 'grey',
		Sent: 'green',
		'Partially sent': 'yellow',
		Failed: 'red',
	};

const HistorySendTime = ({ sentAt }: { sentAt: string }) => {
	const sendTime = useRelativeTime(sentAt, 'long');

	return (
		<span
			css={[historyViewStyles.metadataValue, historyViewStyles.sendTimeValue]}
		>
			<Typography variant={sendTime?.isRelative ? 'bodyBoldSm' : 'bodySm'}>
				{sendTime ? (
					<time
						dateTime={sendTime.iso8601}
						title={sendTime.formattedAbsoluteTime}
					>
						{sendTime.label}
					</time>
				) : (
					sentAt
				)}
			</Typography>
			<SendTimeTooltip sentAt={sentAt} />
		</span>
	);
};

export const HistoryTable = ({ notifications = [] }: HistoryTableProps) => {
	return (
		<Table
			aria-label="Sent alerts"
			cssOverrides={historyViewStyles.table}
			columns={tableColumns}
			headerVisibleFrom="sm"
		>
			<TableHeader cssOverrides={historyViewStyles.tableHeader}>
				<TableColumnHeader isRowHeader>Sent alerts</TableColumnHeader>
				<TableColumnHeader>Sent by</TableColumnHeader>
				<TableColumnHeader>Sent to</TableColumnHeader>
				<TableColumnHeader>Send time</TableColumnHeader>
				<TableColumnHeader>Status</TableColumnHeader>
			</TableHeader>
			<TableBody>
				{notifications.map((notification) => {
					return (
						<TableRow
							key={notification.id}
							id={notification.id}
							cssOverrides={historyViewStyles.tableRow}
						>
							<TableCell
								gridColumn={{ sm: '1', md: '1', lg: '1' }}
								gridRow={{ md: '1 / span 4', lg: 'auto' }}
								cssOverrides={historyViewStyles.notificationCell}
							>
								<div css={historyViewStyles.notification}>
									{notification.thumbnailUrl ? (
										<img
											src={notification.thumbnailUrl}
											alt=""
											css={historyViewStyles.thumbnail}
										/>
									) : (
										<div css={historyViewStyles.thumbnailFallback}>
											<Icon size="sm" symbol="image" />
											<Typography variant="bodyXs">No image</Typography>
										</div>
									)}
									<div css={historyViewStyles.notificationDetails}>
										<Link
											href={notification.href}
											cssOverrides={historyViewStyles.title}
										>
											{notification.title}
										</Link>
										<Typography
											variant="bodyXs"
											cssOverrides={historyViewStyles.channel}
										>
											{notification.channel === 'push' ? (
												<Icon size="sm">{phoneIphoneIcon}</Icon>
											) : (
												<Icon size="sm" symbol="mail" />
											)}
											<span>
												{getChannelName(notification.channel)}
												<span css={historyViewStyles.notificationType}>
													{' | '}
													{notification.alertType}
												</span>
											</span>
										</Typography>
									</div>
								</div>
							</TableCell>
							<TableCell
								gridColumn={{ md: '2', lg: '2' }}
								gridRow={{ md: '1', lg: 'auto' }}
								cssOverrides={historyViewStyles.metadataCell(1)}
							>
								<span css={historyViewStyles.compactLabel} aria-hidden="true">
									Sent by:{' '}
								</span>
								<span css={historyViewStyles.metadataValue}>
									{notification.sentBy}
								</span>
							</TableCell>
							<TableCell
								gridColumn={{ md: '2', lg: '3' }}
								gridRow={{ md: '2', lg: 'auto' }}
								cssOverrides={historyViewStyles.metadataCell(2)}
							>
								<span css={historyViewStyles.compactLabel} aria-hidden="true">
									Sent to:{' '}
								</span>
								<span
									css={[
										historyViewStyles.metadataValue,
										historyViewStyles.regions,
									]}
								>
									{notification.sentTo.map((edition) => (
										<span
											key={edition}
											aria-label={editionNames[edition]}
											role="img"
										>
											<FlagAtom segmentCode={edition} />
										</span>
									))}
								</span>
							</TableCell>
							<TableCell
								gridColumn={{ md: '2', lg: '4' }}
								gridRow={{ md: '3', lg: 'auto' }}
								cssOverrides={historyViewStyles.metadataCell(3)}
							>
								<span css={historyViewStyles.compactLabel} aria-hidden="true">
									Send time:{' '}
								</span>
								<HistorySendTime sentAt={notification.sentAt} />
							</TableCell>
							<TableCell
								gridColumn={{ md: '2', lg: '5' }}
								gridRow={{ md: '4', lg: 'auto' }}
								cssOverrides={historyViewStyles.metadataCell(4)}
							>
								<span css={historyViewStyles.compactLabel} aria-hidden="true">
									Status:{' '}
								</span>
								<span css={historyViewStyles.metadataValue}>
									<Badge
										color={statusColors[notification.status]}
										size="xs"
										weight="strong"
										cssOverrides={historyViewStyles.statusBadge}
									>
										{notification.status}
									</Badge>
								</span>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

export const HistoryTableSkeleton = () => (
	<div role="status" aria-label="Loading alert history" aria-busy="true">
		<Table
			aria-label="Loading sent alerts"
			cssOverrides={historyViewStyles.table}
			columns={tableColumns}
			headerVisibleFrom="sm"
		>
			<TableHeader cssOverrides={historyViewStyles.tableHeader}>
				<TableColumnHeader isRowHeader>Sent alerts</TableColumnHeader>
				<TableColumnHeader>Sent by</TableColumnHeader>
				<TableColumnHeader>Sent to</TableColumnHeader>
				<TableColumnHeader>Send time</TableColumnHeader>
				<TableColumnHeader>Status</TableColumnHeader>
			</TableHeader>
			<TableBody>
				{Array.from({ length: 5 }, (_, index) => (
					<TableRow
						key={index}
						id={`history-skeleton-${index}`}
						cssOverrides={historyViewStyles.tableRow}
					>
						<TableCell
							gridColumn={{ sm: '1', md: '1', lg: '1' }}
							gridRow={{ md: '1 / span 4', lg: 'auto' }}
							cssOverrides={historyViewStyles.notificationCell}
						>
							<div css={historyViewStyles.notification} aria-hidden="true">
								<span css={historyViewStyles.skeletonThumbnail} />
								<div css={historyViewStyles.skeletonNotificationDetails}>
									<span css={historyViewStyles.skeletonLine('85%')} />
									<span css={historyViewStyles.skeletonLine('55%')} />
								</div>
							</div>
						</TableCell>
						{[1, 2, 3, 4].map((column) => (
							<TableCell
								key={column}
								gridColumn={{ md: '2', lg: String(column + 1) }}
								gridRow={{ md: String(column), lg: 'auto' }}
								cssOverrides={historyViewStyles.metadataCell(column)}
							>
								<span
									css={historyViewStyles.skeletonMetadata}
									aria-hidden="true"
								/>
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	</div>
);
