import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
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
import type { ReactNode } from 'react';
import type { DisplayAppAlertTopicEditionId } from '@models';
import { formatHistorySendTime } from '../history-send-time';
import { layoutMainTheme } from '../themes';
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
	sentTo: DisplayAppAlertTopicEditionId[];
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

const getChannelName = (channel: HistoryAlert['channel']) =>
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

export const HistoryTab = ({
	alerts = [],
	isLoading = false,
	error,
}: HistoryTabProps) => {
	return (
		<Layout.Main theme={layoutMainTheme}>
			<section aria-labelledby="history-heading" css={styles.container}>
				<Typography id="history-heading" element="h1" variant="headingLg">
					History
				</Typography>
				{isLoading && (
					<Typography variant="bodyMd">Loading history...</Typography>
				)}
				{error}
				{!isLoading && !error && (
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
							{alerts.map((alert) => {
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
														{getChannelName(alert.channel)} | {alert.alertType}
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
				)}
				{!isLoading && !error && alerts.length === 0 && (
					<Typography variant="bodyMd" cssOverrides={styles.empty}>
						No alerts have been sent yet.
					</Typography>
				)}
			</section>
		</Layout.Main>
	);
};
