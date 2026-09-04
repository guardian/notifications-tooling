import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSpacing,
	semanticTypography,
} from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { Icon } from '@guardian/stand/Icon';
import { Layout } from '@guardian/stand/Layout';
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
import { from, until } from '@guardian/stand/utils';
import type { DisplayAppAlertTopicEditionId } from '@models';
import type { ReactNode } from 'react';
import { formatHistorySendTime } from '../history-send-time';
import { layoutMainTheme } from '../themes';
import { FlagAtom } from './FlagAtom';
import { phoneIphoneIcon } from './FlagIcons';
import { HistoryPagination } from './HistoryPagination';

type HistoryStatus = 'Accepted' | 'Sent' | 'Partially sent' | 'Failed';

export interface HistoryNotification {
	id: string;
	title: string;
	href: string;
	thumbnailUrl?: string;
	channel: 'email' | 'push';
	alertType: string;
	sentBy: string;
	sentTo: DisplayAppAlertTopicEditionId[];
	sentAt: string;
	status: HistoryStatus;
}

interface HistoryViewProps {
	notifications?: HistoryNotification[];
	totalItems?: number;
	limit: number;
	currentPage: number;
	isLoading?: boolean;
	error?: ReactNode;
	handlePageChange: (page: number) => void;
}

const styles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackMd,
		padding: semanticSpacing.stackLg,
	}),
	header: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackMd,
		[from.md]: {
			flexDirection: 'row',
			alignItems: 'center',
		},
	}),
	titleBlock: css({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	}),
	notification: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackSm,
		minWidth: 0,
	}),
	thumbnail: css({
		width: '60px',
		height: '60px',
		flexShrink: 0,
		objectFit: 'cover',
	}),
	thumbnailFallback: css({
		display: 'flex',
		width: '60px',
		height: '60px',
		flexShrink: 0,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: semanticSpacing.stackXxs,
		textAlign: 'center',
		color: semanticColors.text.weak,
		backgroundColor: semanticColors.fill.neutralWeak,
	}),
	notificationDetails: css({
		display: 'flex',
		minWidth: 0,
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
	}),
	title: css({
		display: '-webkit-box',
		overflow: 'hidden',
		WebkitBoxOrient: 'vertical',
		WebkitLineClamp: 2,
	}),
	channel: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		color: semanticColors.text.weak,
	}),
	notificationType: css({
		display: 'none',
		'@media (min-width: 600px)': {
			display: 'inline',
		},
	}),
	regions: css({
		display: 'inline-flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		'& svg': {
			display: 'block',
			width: '24px',
			height: '18px',
		},
	}),
	table: css({
		'@media (min-width: 600px) and (max-width: 1055.9px)': {
			'& [role="row"]': {
				gridTemplateColumns: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
			},
		},
	}),
	tableHeader: css({
		'& > tr > *': {
			padding: '16px',
		},
		'& > tr > :not(:first-of-type)': {
			display: 'none',
			[from.lg]: {
				display: 'block',
			},
		},
	}),
	tableRow: css({
		rowGap: semanticSpacing.stackXs,
		paddingBlock: semanticSpacing.stackXs,
		[from.lg]: {
			rowGap: 0,
			paddingBlock: 0,
		},
	}),
	notificationCell: css({
		'@media (min-width: 600px) and (max-width: 1055.9px)': {
			alignSelf: 'start',
		},
		'@media (min-width: 600px) and (max-width: 829.9px)': {
			gridColumn: '1',
			gridRow: '1 / span 4',
		},
	}),
	metadataCell: (row: number) =>
		css({
			paddingBlock: 0,
			[until.lg]: {
				display: 'grid',
				gridTemplateColumns: '80px minmax(0, 1fr)',
				alignItems: 'center',
			},
			'@media (min-width: 600px) and (max-width: 829.9px)': {
				gridColumn: '2',
				gridRow: String(row),
			},
		}),
	compactLabel: css({
		color: semanticColors.text.weak,
		[until.lg]: {
			display: 'inline',
		},
		[from.lg]: {
			display: 'none',
		},
	}),
	metadataValue: css({
		minWidth: 0,
	}),
	statusBadge: css({
		boxSizing: 'border-box',
		height: '18px',
		paddingBlock: 0,
		paddingInline: '6px',
		whiteSpace: 'nowrap',
		[from.lg]: {
			height: '24px',
			paddingInline: '8px',
			font: semanticTypography.headingSm.font,
			letterSpacing: semanticTypography.headingSm.letterSpacing,
		},
	}),
	empty: css({
		margin: 0,
		padding: `${semanticSpacing.stackLg} 0`,
		color: semanticColors.text.weak,
	}),
};

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

export const HistoryView = ({
	notifications = [],
	totalItems = 0,
	isLoading = false,
	limit,
	error,
	currentPage,
	handlePageChange,
}: HistoryViewProps) => {
	return (
		<Layout.Main theme={layoutMainTheme}>
			<section aria-labelledby="history-heading" css={styles.container}>
				<div css={styles.header}>
					<div css={styles.titleBlock}>
						<Typography id="history-heading" element="h1" variant="headingLg">
							History
						</Typography>
					</div>
					{!isLoading && !error && totalItems > limit && (
						<HistoryPagination
							currentPage={currentPage}
							totalItems={totalItems}
							onPageChange={handlePageChange}
							limit={limit}
						/>
					)}
				</div>
				{isLoading && (
					<Typography variant="bodyMd">Loading history...</Typography>
				)}
				{error}
				{!isLoading && !error && (
					<Table
						aria-label="Sent alerts"
						cssOverrides={styles.table}
						columns={{
							sm: 'minmax(0, 1fr)',
							md: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
							lg: 'minmax(280px, 2.4fr) minmax(180px, 1.2fr) minmax(150px, 1fr) minmax(160px, 1fr) 132px',
						}}
						headerVisibleFrom="sm"
					>
						<TableHeader cssOverrides={styles.tableHeader}>
							<TableColumnHeader isRowHeader>Sent alerts</TableColumnHeader>
							<TableColumnHeader>Sent by</TableColumnHeader>
							<TableColumnHeader>Sent to</TableColumnHeader>
							<TableColumnHeader>Send time</TableColumnHeader>
							<TableColumnHeader>Status</TableColumnHeader>
						</TableHeader>
						<TableBody>
							{notifications.map((notification) => {
								const sendTime = formatHistorySendTime(notification.sentAt);

								return (
									<TableRow
										key={notification.id}
										id={notification.id}
										cssOverrides={styles.tableRow}
									>
										<TableCell
											gridColumn={{ sm: '1', md: '1', lg: '1' }}
											gridRow={{ md: '1 / span 4', lg: 'auto' }}
											cssOverrides={styles.notificationCell}
										>
											<div css={styles.notification}>
												{notification.thumbnailUrl ? (
													<img
														src={notification.thumbnailUrl}
														alt=""
														css={styles.thumbnail}
													/>
												) : (
													<div css={styles.thumbnailFallback}>
														<Icon size="sm" symbol="image" />
														<Typography variant="bodyXs">No image</Typography>
													</div>
												)}
												<div css={styles.notificationDetails}>
													<Link
														href={notification.href}
														cssOverrides={styles.title}
													>
														{notification.title}
													</Link>
													<Typography
														variant="bodyXs"
														cssOverrides={styles.channel}
													>
														{notification.channel === 'push' ? (
															<Icon size="sm">{phoneIphoneIcon}</Icon>
														) : (
															<Icon size="sm" symbol="mail" />
														)}
														<span>
															{getChannelName(notification.channel)}
															<span css={styles.notificationType}>
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
											cssOverrides={styles.metadataCell(1)}
										>
											<span css={styles.compactLabel} aria-hidden="true">
												Sent by:{' '}
											</span>
											<span css={styles.metadataValue}>
												{notification.sentBy}
											</span>
										</TableCell>
										<TableCell
											gridColumn={{ md: '2', lg: '3' }}
											gridRow={{ md: '2', lg: 'auto' }}
											cssOverrides={styles.metadataCell(2)}
										>
											<span css={styles.compactLabel} aria-hidden="true">
												Sent to:{' '}
											</span>
											<span css={[styles.metadataValue, styles.regions]}>
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
											cssOverrides={styles.metadataCell(3)}
										>
											<span css={styles.compactLabel} aria-hidden="true">
												Send time:{' '}
											</span>
											<span css={styles.metadataValue}>
												<Typography
													variant={sendTime.isRecent ? 'bodyBoldSm' : 'bodySm'}
												>
													{sendTime.label}
												</Typography>
											</span>
										</TableCell>
										<TableCell
											gridColumn={{ md: '2', lg: '5' }}
											gridRow={{ md: '4', lg: 'auto' }}
											cssOverrides={styles.metadataCell(4)}
										>
											<span css={styles.compactLabel} aria-hidden="true">
												Status:{' '}
											</span>
											<span css={styles.metadataValue}>
												<Badge
													color={statusColors[notification.status]}
													size="xs"
													weight="strong"
													cssOverrides={styles.statusBadge}
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
				)}
				{!isLoading && !error && notifications.length === 0 && (
					<Typography variant="bodyMd" cssOverrides={styles.empty}>
						No alerts have been sent yet.
					</Typography>
				)}
			</section>
		</Layout.Main>
	);
};
