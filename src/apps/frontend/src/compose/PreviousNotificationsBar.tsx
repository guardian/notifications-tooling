import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Avatar } from '@guardian/stand/Avatar';
import { Typography } from '@guardian/stand/Typography';
import { usePreviousNotifications } from '../hooks/usePreviousNotifications';

interface Props {
	articleId?: string;
}

const emailToIntials = (sentBy: string): string => {
	const names = sentBy.split('@').at(0)?.split('.') ?? [];
	const [firstName, lastName] = names;
	return `${firstName?.at(0) ?? ''}${lastName?.at(0) ?? ''}`;
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
};

export const PreviousNotificationsBar = ({ articleId }: Props) => {
	const { data: previousSends, error } = usePreviousNotifications(articleId);
	if (previousSends || error) {
		console.log({ previousSends, error });
	}

	if (!previousSends) {
		return null;
	}

	return (
		<div css={style.bar}>
			{previousSends.notifications.map((send, index) => (
				<Avatar
					initials={emailToIntials(send.createdByEmail)}
					key={index}
					alt={send.createdByEmail}
				/>
			))}
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
