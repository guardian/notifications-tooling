import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Avatar } from '@guardian/stand/Avatar';
import { IconButton } from '@guardian/stand/IconButton';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { type NotificationChannelId, notificationChannelNames } from '@models';
import { useState } from 'react';
import { usePreviousNotifications } from '../hooks/usePreviousNotifications';
import type { NotificationSummary } from '../schemas';
import { FlagAtom } from '../ui/FlagAtom';
import { darkTooltipTheme, Tooltip } from '../ui/Tooltip';
import {
	getSenderDisplayName,
	getSenderInitials,
} from '../utils/display-text-helpers';
import { mapNotificationToHistoryNotification } from '../utils/notification-history-mapper';
import { formatAbsoluteTime } from '../utils/relative-time';

interface Props {
	articleId?: string;
	showImportedArticle: boolean;
}

const style = {
	bar: css({
		backgroundColor: semanticColors.fill.informationWeak,
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: semanticSpacing.stackXs,
		paddingLeft: semanticSpacing.stackXs,
		paddingRight: semanticSpacing.stackXs,
		paddingTop: 6,
		paddingBottom: 6,
		boxShadow: '0px 2px 6px 0px rgba(0, 0, 0, 0.15)',
		marginBottom: semanticSpacing.stackMd,
	}),
	avatars: css({
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row-reverse',
		direction: 'rtl',
		paddingLeft: 10,
	}),
	avatarWrapper: css({
		maxWidth: 18,
	}),
	avatarOverrides: css({
		borderWidth: 1,
		borderStyle: 'solid',
		borderColor: semanticColors.border.strongInverse,
		width: '1.5rem',
		height: '1.5rem',
		fontSize: '8px',
	}),
	senderList: css({
		listStyle: 'none',
		margin: 0,
		padding: 0,
	}),
	detailList: css({
		display: 'grid',
		gap: semanticSpacing.stackXs,
		listStyle: 'none',
		margin: 0,
		padding: 0,
	}),
	detailItem: css({
		display: 'grid',
		gap: semanticSpacing.stackXxs,
	}),
	detailHeading: css({
		whiteSpace: 'nowrap',
	}),
	detailAudiences: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXxs,
		minHeight: 24,
		svg: {
			display: 'block',
			maxHeight: 24,
			width: 'auto',
		},
	}),
};

const getChannel = (send: NotificationSummary): NotificationChannelId => {
	const keys = Object.keys(send.channels);

	if (keys.includes('app-push')) {
		return 'app-push';
	}
	if (keys.includes('newsletter')) {
		return 'newsletter';
	}
	return 'app-push';
};

const getChannelDescriptionForSet = (sends: NotificationSummary[]): string => {
	if (sends.length > 1) {
		return 'an alert';
	}

	const channel = getChannel(sends[0]!);
	return `${channel === 'app-push' ? 'an' : 'a'} ${notificationChannelNames[channel]}`;
};

const SenderAvatar = ({ send }: { send: NotificationSummary }) => {
	return (
		<div css={style.avatarWrapper}>
			<Avatar
				cssOverrides={style.avatarOverrides}
				size="sm"
				initials={getSenderInitials(send.createdByEmail)}
			/>
		</div>
	);
};

const CombinedAvatar = () => {
	return (
		<div css={style.avatarWrapper}>
			<Avatar
				size="sm"
				initials={'…'}
				cssOverrides={[
					style.avatarOverrides,
					css({
						backgroundColor: semanticColors.fill.neutralWeak,
						alignItems: 'start',
						fontSize: 'large',
					}),
				]}
			/>
		</div>
	);
};

const SenderAvatars = ({ sends }: { sends: NotificationSummary[] }) => {
	const firstThreeSends = sends.slice(0, 3);
	const sendsPastThree = sends.slice(3);
	const senderNames = [
		...new Set(sends.map((send) => getSenderDisplayName(send.createdByEmail))),
	];

	return (
		<Tooltip
			label={senderNames.length === 1 ? senderNames[0]! : 'senders'}
			trigger={
				<div css={style.avatars}>
					{firstThreeSends.map((send) => (
						<SenderAvatar key={send.id} send={send} />
					))}
					{sendsPastThree.length === 1 && (
						<SenderAvatar send={sendsPastThree[0]!} />
					)}
					{sendsPastThree.length > 1 && <CombinedAvatar />}
				</div>
			}
			theme={darkTooltipTheme}
			cssOverrides={css({ padding: semanticSpacing.stackSm })}
		>
			{senderNames.length === 1 ? (
				senderNames[0]
			) : (
				<ul css={style.senderList}>
					{senderNames.map((name) => (
						<li key={name}>{name}</li>
					))}
				</ul>
			)}
		</Tooltip>
	);
};

const formatTime = (input: string): string => {
	const sentAt = new Date(input);
	
	return Number.isNaN(sentAt.getTime()) ? input : formatAbsoluteTime(sentAt);
};

const SendDetails = ({
	send,
	showSenderAndChannel,
}: {
	send: NotificationSummary;
	showSenderAndChannel: boolean;
}) => {
	const channel = getChannel(send);
	const audiences = mapNotificationToHistoryNotification(send)?.sentTo ?? [];
	const displayedAudiences =
		audiences.length > 0
			? audiences
			: [{ id: 'INT' as const, label: 'International' }];

	return (
		<li css={style.detailItem}>
			<div css={style.detailHeading}>
				{showSenderAndChannel && (
					<>
						{getSenderDisplayName(send.createdByEmail)},{' '}
						{notificationChannelNames[channel]},{' '}
					</>
				)}
				{formatTime(send.createdAt)}
			</div>
			<div css={style.detailAudiences}>
				{displayedAudiences.map(({ id, label }) => (
					<span key={id} aria-label={label} role="img">
						<FlagAtom segmentCode={id} />
					</span>
				))}
			</div>
		</li>
	);
};

const SendingDetails = ({ sends }: { sends: NotificationSummary[] }) => {
	return (
		<div
			css={{
				marginLeft: 'auto',
				display: 'flex',
				alignItems: 'center',
				gap: semanticSpacing.stackXxs,
			}}
		>
			<Typography variant="bodySm" color={semanticColors.text.weak}>
				Send info
			</Typography>
			<Tooltip
				theme={darkTooltipTheme}
				label="send details"
				cssOverrides={css({
					width: 'max-content',
					maxWidth: 'calc(100vw - 2rem)',
					color: semanticColors.text.weak,
				})}
			>
				<ul css={style.detailList}>
					{sends.map((send) => (
						<SendDetails
							key={send.id}
							send={send}
							showSenderAndChannel={sends.length > 1}
						/>
					))}
				</ul>
			</Tooltip>
		</div>
	);
};

export const PreviousNotificationsBar = ({
	articleId,
	showImportedArticle,
}: Props) => {
	const [dismissedFor, setDismissedFor] = useState<string>();

	const {
		data,
		error,
		articleId: requestedDataArticleId,
	} = usePreviousNotifications(
		dismissedFor !== articleId ? articleId : undefined,
	);

	const sentNotifications =
		data?.notifications.filter(
			(send) => !send.dryRun && send.status !== 'failed',
		) ?? [];

	if (error) {
		return (
			<InlineMessage level="error">
				Failed to check for previous sends: {error.message}
			</InlineMessage>
		);
	}

	if (
		!showImportedArticle ||
		!articleId ||
		sentNotifications.length === 0 ||
		requestedDataArticleId !== articleId ||
		dismissedFor === articleId
	) {
		return null;
	}

	const description = getChannelDescriptionForSet(sentNotifications);

	return (
		<div css={style.bar}>
			<SenderAvatars sends={sentNotifications} />
			<Typography variant="bodySm">Sent {description} with this URL</Typography>
			<SendingDetails sends={sentNotifications} />
			<IconButton
				onClick={() => setDismissedFor(articleId)}
				ariaLabel="dismiss"
				size="xs"
				symbol="close"
				variant="tertiary"
				theme={{
					tertiary: {
						shared: {
							border: 'none',
							hover: {
								border: 'none',
							},
						},
					},
				}}
			/>
		</div>
	);
};
