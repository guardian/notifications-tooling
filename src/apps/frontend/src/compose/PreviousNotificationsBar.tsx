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
import type { LocalSendTimeRegion } from '../utils/history-send-time';
import { formatLocalSendDateTimes } from '../utils/history-send-time';
import { parseAudience } from '../utils/parse-notification-audience';

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
	nameList: css({
		listStyle: 'none',
	}),
	sendDetails: css({
		marginLeft: 'auto',
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXxs,
	}),
	sendDetailsList: css({
		listStyle: 'none',
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXs,
	}),
	sendDetailsItem: css({
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		gap: semanticSpacing.stackXxs,
	}),
	audienceIcons: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXxs,

		// need enough specificity to override the styling applied to the svg in
		// tooltip arrow
		'.no-rotate>svg': {
			transform: 'none',
			width: 20,
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
	const channels = sends.map(getChannel);
	if (channels.every((channel) => channel === 'app-push')) {
		return `an ${notificationChannelNames['app-push']}`;
	}
	if (channels.every((channel) => channel === 'newsletter')) {
		return `a ${notificationChannelNames['newsletter']}`;
	}
	return 'notifications';
};

const AvatarsWithTooltip = ({
	sentNotifications,
}: {
	sentNotifications: NotificationSummary[];
}) => {
	const firstThreeSends = sentNotifications.slice(0, 3);
	const sendsPastThree = sentNotifications.slice(3);

	return (
		<Tooltip
			placement="bottom start"
			label={'senders'}
			trigger={
				<div css={style.avatars}>
					{firstThreeSends.map((send) => (
						<div css={style.avatarWrapper} key={send.id}>
							<Avatar
								cssOverrides={style.avatarOverrides}
								size="sm"
								initials={getSenderInitials(send.createdByEmail)}
							/>
						</div>
					))}

					{sendsPastThree.length === 1 &&
						sendsPastThree.map((send) => (
							<div css={style.avatarWrapper} key={send.id}>
								<Avatar
									cssOverrides={style.avatarOverrides}
									size="sm"
									initials={getSenderInitials(send.createdByEmail)}
								/>
							</div>
						))}
					{sendsPastThree.length > 1 && (
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
					)}
				</div>
			}
			theme={darkTooltipTheme}
			cssOverrides={css({
				padding: semanticSpacing.stackSm,
			})}
		>
			<ul css={style.nameList}>
				{sentNotifications.map((send) => (
					<li key={send.id}>{getSenderDisplayName(send.createdByEmail)}</li>
				))}
			</ul>
		</Tooltip>
	);
};

const formatTime = (
	input: string,
	preferredRegion: LocalSendTimeRegion = 'UK',
): string => {
	return (
		formatLocalSendDateTimes(input)
			.find((time) => time.region === preferredRegion)
			?.time.split(', ')
			.toReversed()
			.join(' ') ?? input
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
			(send) =>
				!send.dryRun && send.status !== 'failed' && send.kind === 'send',
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

	const getSendText = (send: NotificationSummary) =>
		sentNotifications.length > 1
			? [
					getSenderDisplayName(send.createdByEmail),
					notificationChannelNames[getChannel(send)],
					formatTime(send.createdAt),
				].join(', ')
			: [
					notificationChannelNames[getChannel(send)],
					formatTime(send.createdAt),
				].join(', ');

	return (
		<div css={style.bar}>
			<AvatarsWithTooltip sentNotifications={sentNotifications} />
			<Typography variant="bodySm">Sent {description} with this URL</Typography>
			<div css={style.sendDetails}>
				<Typography variant="bodySm" color={semanticColors.text.weak}>
					Send info
				</Typography>
				<Tooltip
					theme={darkTooltipTheme}
					label="send times"
					cssOverrides={css({
						maxWidth: 'unset',
						color: semanticColors.text.weak,
						padding: semanticSpacing.stackSm,
					})}
				>
					<ul css={style.sendDetailsList}>
						{sentNotifications.map((send) => (
							<li css={style.sendDetailsItem} key={send.id}>
								<span>{getSendText(send)}</span>
								<div css={style.audienceIcons}>
									{parseAudience(send).map((audienceId) => (
										<span
											className="no-rotate"
											key={audienceId}
											title={audienceId}
										>
											<FlagAtom segmentCode={audienceId} />
										</span>
									))}
								</div>
							</li>
						))}
					</ul>
				</Tooltip>
			</div>
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
