import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSpacing } from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { Icon } from '@guardian/stand/Icon';
import { Layout } from '@guardian/stand/Layout';
import { Link } from '@guardian/stand/Link';
import { Pagination, type PaginationTheme } from '@guardian/stand/Pagination';
import {
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { formatHistorySendTime } from '../history-send-time';
import { layoutMainTheme } from '../themes';
import type { Edition } from '../types';
import { FlagAtom } from './FlagAtom';

type HistoryStatus = 'Accepted' | 'Sent' | 'Partially sent' | 'Failed';

export interface HistoryAlert {
	id: string;
	title: string;
	href: string;
	thumbnailUrl?: string;
	channel: 'email' | 'push';
	alertType: string;
	sentBy: string;
	sentTo: Edition[];
	sentAt: string;
	status: HistoryStatus;
}

interface HistoryTabProps {
	alerts?: HistoryAlert[];
	isLoading?: boolean;
	error?: ReactNode;
}

const styles = {
	container: css({
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackLg,
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
	paginationWrapper: css({
		width: '100%',
		minWidth: 0,
		display: 'flex',
		paddingTop: semanticSpacing.stackXs,
		[from.md]: {
			paddingTop: 0,
			marginLeft: 'auto',
			width: 'auto',
		},
	}),
	pagination: css({
		width: '100%',
		maxWidth: '100%',
		justifyContent: 'space-between',
		'& ul button[data-hovered], & ul button:hover': {
			color: semanticColors.text.strongerInverse,
		},
		'& > button': {
			color: semanticColors.text.strong,
			background: semanticColors.bg.base,
			border: `1px solid ${semanticColors.border.weak}`,
			'&[data-hovered], &:hover': {
				color: semanticColors.text.strongerInverse,
				background: baseColors.magenta[200],
				border: `1px solid ${baseColors.magenta[200]}`,
			},
			'&[data-pressed], &:active': {
				color: semanticColors.text.strongerInverse,
				background: baseColors.magenta[200],
				border: `1px solid ${baseColors.magenta[200]}`,
			},
			'&[data-disabled], &:disabled': {
				color: semanticColors.text.disabled,
				background: semanticColors.fill.disabled,
				border: `1px solid ${semanticColors.fill.disabled}`,
			},
		},
		[from.md]: {
			width: 'auto',
			justifyContent: 'flex-end',
		},
	}),
	alert: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackSm,
		minWidth: 0,
	}),
	thumbnail: css({
		width: '52px',
		height: '52px',
		flexShrink: 0,
		objectFit: 'cover',
	}),
	thumbnailFallback: css({
		display: 'flex',
		width: '52px',
		height: '52px',
		flexShrink: 0,
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		color: semanticColors.text.weak,
		backgroundColor: semanticColors.fill.weak,
	}),
	alertDetails: css({
		display: 'flex',
		minWidth: 0,
		flexDirection: 'column',
		gap: semanticSpacing.stackXxs,
	}),
	channel: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		color: semanticColors.text.weak,
	}),
	regions: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
	}),
	empty: css({
		margin: 0,
		padding: `${semanticSpacing.stackLg} 0`,
		color: semanticColors.text.weak,
	}),
};

const PAGE_SIZE = 2;

const paginationTheme: PaginationTheme = {
	item: {
		current: {
			backgroundColor: baseColors.magenta[200],
			borderColor: baseColors.magenta[200],
			color: semanticColors.text.strongerInverse,
		},
		hover: {
			backgroundColor: baseColors.magenta[200],
			borderColor: baseColors.magenta[200],
		},
		active: {
			backgroundColor: baseColors.magenta[200],
		},
		focusVisible: {
			outlineColor: baseColors.magenta[700],
		},
	},
};

const getChannelName = (channel: HistoryAlert['channel']) =>
	channel === 'push' ? 'App alert' : 'Newsletter email';

const editionNames: Record<Edition, string> = {
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

export const HistoryTab = ({
	alerts = [],
	isLoading = false,
	error,
}: HistoryTabProps) => {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.max(1, Math.ceil(alerts.length / PAGE_SIZE));
	const activePage = Math.min(currentPage, totalPages);
	const pageStart = (activePage - 1) * PAGE_SIZE;
	const visibleAlerts = alerts.slice(pageStart, pageStart + PAGE_SIZE);

	const handlePageChange = (page: number) => {
		setCurrentPage(Math.min(page, totalPages));
	};

	return (
		<Layout.Main theme={layoutMainTheme}>
			<section aria-labelledby="history-heading" css={styles.container}>
				<div css={styles.header}>
					<div css={styles.titleBlock}>
						<Typography id="history-heading" element="h1" variant="headingLg">
							History
						</Typography>
					</div>
					{!isLoading && !error && alerts.length > PAGE_SIZE && (
						<div css={styles.paginationWrapper}>
							<Pagination
								currentPage={activePage}
								totalItems={alerts.length}
								pageSize={PAGE_SIZE}
								onPageChange={handlePageChange}
								theme={paginationTheme}
								cssOverrides={styles.pagination}
								collapseBelow="md"
							/>
						</div>
					)}
				</div>
				{isLoading ? (
					<Typography variant="bodyMd">Loading history...</Typography>
				) : (
					error ?? (
					<>
						<Table
							aria-label="Sent alerts"
							columns={{
								sm: 'minmax(0, 1fr)',
								md: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
								lg: 'minmax(280px, 2.4fr) minmax(180px, 1.2fr) minmax(150px, 1fr) minmax(160px, 1fr) 88px',
							}}
							headerVisibleFrom="lg"
						>
							<TableHeader>
								<TableColumnHeader isRowHeader>Sent alerts</TableColumnHeader>
								<TableColumnHeader>Sent by</TableColumnHeader>
								<TableColumnHeader>Sent to</TableColumnHeader>
								<TableColumnHeader>Send time</TableColumnHeader>
								<TableColumnHeader>Status</TableColumnHeader>
							</TableHeader>
							<TableBody>
								{visibleAlerts.map((alert) => {
									const sendTime = formatHistorySendTime(alert.sentAt);

									return (
										<TableRow key={alert.id} id={alert.id}>
											<TableCell
												gridColumn={{ sm: '1', md: '1', lg: '1' }}
												gridRow={{ md: '1 / span 4', lg: 'auto' }}
											>
												<div css={styles.alert}>
													{alert.thumbnailUrl ? (
														<img
															src={alert.thumbnailUrl}
															alt=""
															css={styles.thumbnail}
														/>
													) : (
														<div css={styles.thumbnailFallback}>
															<Typography variant="bodyXs">No image</Typography>
														</div>
													)}
													<div css={styles.alertDetails}>
														<Link href={alert.href}>{alert.title}</Link>
														<Typography
															variant="bodyXs"
															cssOverrides={styles.channel}
														>
															<Icon
																size="sm"
																symbol={
																	alert.channel === 'push' ? 'mobile_3' : 'mail'
																}
															/>
															{getChannelName(alert.channel)} |{' '}
															{alert.alertType}
														</Typography>
													</div>
												</div>
											</TableCell>
											<TableCell
												compactLabel="Sent by: "
												gridColumn={{ md: '2', lg: '2' }}
												gridRow={{ md: '1', lg: 'auto' }}
											>
												{alert.sentBy}
											</TableCell>
											<TableCell
												compactLabel="Sent to: "
												gridColumn={{ md: '2', lg: '3' }}
												gridRow={{ md: '2', lg: 'auto' }}
											>
												<span css={styles.regions}>
													{alert.sentTo.map((edition) => (
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
												compactLabel="Send time: "
												gridColumn={{ md: '2', lg: '4' }}
												gridRow={{ md: '3', lg: 'auto' }}
											>
												<Typography
													variant={sendTime.isRecent ? 'bodyBoldSm' : 'bodySm'}
												>
													{sendTime.label}
												</Typography>
											</TableCell>
											<TableCell
												compactLabel="Status: "
												gridColumn={{ md: '2', lg: '5' }}
												gridRow={{ md: '4', lg: 'auto' }}
											>
												<Badge
													color={statusColors[alert.status]}
													size="sm"
													weight="light"
												>
													{alert.status}
												</Badge>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
						{alerts.length === 0 && (
							<Typography variant="bodyMd" cssOverrides={styles.empty}>
								No alerts have been sent yet.
							</Typography>
						)}
					</>
					)
				)}
			</section>
		</Layout.Main>
	);
};
