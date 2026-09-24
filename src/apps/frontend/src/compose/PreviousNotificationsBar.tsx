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
import { darkTooltipTheme, Tooltip } from '../ui/Tooltip';
import { capitalise } from '../utils/display-text-helpers';
import type { LocalSendTimeRegion } from '../utils/history-send-time';
import { formatLocalSendDateTimes } from '../utils/history-send-time';

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
	detailTable: css({
		thead: {
			visibility: 'collapse',
		},
		td: {
			paddingLeft: semanticSpacing.stackXxs,
			paddingRight: semanticSpacing.stackXxs,
			paddingBottom: 2,
		},
		'td:first-child': {
			paddingLeft: 0,
		},
		'td:last-child': {
			paddingRight: 0,
		},
	}),
};

const emailToIntials = (sentBy: string): string => {
	const names = sentBy.split('@').at(0)?.split('.') ?? [];
	const [firstName, lastName] = names;
	return `${firstName?.at(0) ?? ''}${lastName?.at(0) ?? ''}`;
};

const emailToName = (sentBy: string): string => {
	const names = sentBy.split('@').at(0)?.split('.') ?? [];
	return names.map(capitalise).join(' ');
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

const SenderAvatar = ({ send }: { send: NotificationSummary }) => {
	return (
		<div css={style.avatarWrapper}>
			<Tooltip
				label={emailToName(send.createdByEmail)}
				trigger={
					<Avatar
						cssOverrides={style.avatarOverrides}
						size="sm"
						initials={emailToIntials(send.createdByEmail)}
					/>
				}
				theme={darkTooltipTheme}
				cssOverrides={css({
					padding: semanticSpacing.stackSm,
				})}
			>
				{emailToName(send.createdByEmail)}
			</Tooltip>
		</div>
	);
};

const CombinedAvatar = ({ sends }: { sends: NotificationSummary[] }) => {
	return (
		<div css={style.avatarWrapper}>
			<Tooltip
				label={'other senders'}
				trigger={
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
				}
				theme={darkTooltipTheme}
				cssOverrides={css({
					padding: semanticSpacing.stackSm,
				})}
			>
				<ul css={{ listStyle: 'none' }}>
					{sends.map((send, index) => (
						<li key={index}>{emailToName(send.createdByEmail)}</li>
					))}
				</ul>
			</Tooltip>
		</div>
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

const SendingDetails = ({ sends }: { sends: NotificationSummary[] }) => {
	return (
		<>
			{sends.length === 1 ? (
				<>
					{sends.map((send, index) => (
						<Typography
							key={index}
							variant="bodySm"
							color={semanticColors.text.weak}
						>
							[{send.createdAt}]
						</Typography>
					))}
				</>
			) : (
				<div
					css={{
						marginLeft: 'auto',
						display: 'flex',
						alignItems: 'center',
						gap: semanticSpacing.stackXxs,
					}}
				>
					<Typography variant="bodySm" color={semanticColors.text.weak}>
						Timestamp
					</Typography>
					<Tooltip
						theme={darkTooltipTheme}
						label="send times"
						cssOverrides={css({
							maxWidth: 'unset',
							color: semanticColors.text.weak,
						})}
					>
						<table css={style.detailTable}>
							<thead>
								<tr>
									<th>sender</th>
									<th>channel</th>
									<th>send time</th>
								</tr>
							</thead>
							<tbody>
								{sends.map((send, index) => (
									<tr key={index}>
										<td>{emailToName(send.createdByEmail)}</td>
										<td>{notificationChannelNames[getChannel(send)]}</td>
										<td>{formatTime(send.createdAt)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</Tooltip>
				</div>
			)}
		</>
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
	const firstThreeSends = sentNotifications.slice(0, 3);
	const sendsPastThree = sentNotifications.slice(3);

	return (
		<div css={style.bar}>
			<div css={style.avatars}>
				{firstThreeSends.map((send, index) => (
					<SenderAvatar key={index} send={send} />
				))}

				{sendsPastThree.length === 1 &&
					sendsPastThree.map((send, index) => (
						<SenderAvatar key={index} send={send} />
					))}
				{sendsPastThree.length > 1 && <CombinedAvatar sends={sendsPastThree} />}
			</div>
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
