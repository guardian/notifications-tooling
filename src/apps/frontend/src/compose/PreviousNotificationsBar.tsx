import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Avatar } from '@guardian/stand/Avatar';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { usePreviousNotifications } from '../hooks/usePreviousNotifications';
import type { NotificationSummary } from '../schemas';
import { Tooltip } from '../ui/Tooltip';
import { capitalise } from '../utils/display-text-helpers';

interface Props {
	articleId?: string;
	showImportedArticle: boolean;
}

const emailToIntials = (sentBy: string): string => {
	const names = sentBy.split('@').at(0)?.split('.') ?? [];
	const [firstName, lastName] = names;
	return `${firstName?.at(0) ?? ''}${lastName?.at(0) ?? ''}`;
};

const emailToName = (sentBy: string): string => {
	const names = sentBy.split('@').at(0)?.split('.') ?? [];
	return names.map(capitalise).join(' ');
};

const style = {
	bar: css({
		backgroundColor: semanticColors.fill.informationWeak,
		display: 'flex',
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
		maxWidth: 22,
	}),
	avatarBorder: css({
		borderWidth: 1,
		borderStyle: 'solid',
		borderColor: semanticColors.border.strongInverse,
	}),
};

const SenderAvatar = ({ send }: { send: NotificationSummary }) => {
	return (
		<div css={style.avatarWrapper}>
			<Tooltip
				label={emailToName(send.createdByEmail)}
				trigger={
					<Avatar
						cssOverrides={style.avatarBorder}
						size="sm"
						initials={emailToIntials(send.createdByEmail)}
					/>
				}
				theme={{
					color: semanticColors.text.strongerInverse,
					backgroundColor: semanticColors.fill.strong,
				}}
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
				label={sends.map((send) => send.createdByEmail).join(', ')}
				trigger={
					<Avatar
						size="sm"
						initials={'…'}
						cssOverrides={[
							style.avatarBorder,
							css({
								backgroundColor: semanticColors.fill.neutralWeak,
								alignItems: 'start',
								fontSize: 'large',
							}),
						]}
					/>
				}
				theme={{
					color: semanticColors.text.strongerInverse,
					backgroundColor: semanticColors.fill.strong,
				}}
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

export const PreviousNotificationsBar = ({
	articleId,
	showImportedArticle,
}: Props) => {
	const {
		data: previousSends,
		error,
		articleId: requestedDataArticleId,
	} = usePreviousNotifications(articleId);

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
		!previousSends ||
		requestedDataArticleId !== articleId
	) {
		return null;
	}

	const firstThreeSends = previousSends.notifications.slice(0, 3);
	const sendsPastThree = previousSends.notifications.slice(3);

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
			<Typography>Sent an app alert with this URL</Typography>
			{previousSends.notifications.length === 1 ? (
				<Typography>
					[{previousSends.notifications.at(0)?.createdAt}]
				</Typography>
			) : (
				<Typography>Timestamp</Typography>
			)}
		</div>
	);
};
