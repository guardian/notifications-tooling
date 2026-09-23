import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Avatar } from '@guardian/stand/Avatar';
import { Typography } from '@guardian/stand/Typography';
import { useEffect, useState } from 'react';
import type { ArticlePreviousSendsResponse } from '../../../../packages/models';
import { usePreviousNotifications } from '../hooks/usePreviousNotifications';

interface Props {
	articleId?: string;
}

const getPreviousSends = async (
	articleId?: string,
): Promise<ArticlePreviousSendsResponse | undefined> => {
	if (!articleId) {
		return undefined;
	}
	await Promise.resolve();
	return {
		articleId,
		total: 1,
		sends: [
			{
				notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
				sentBy: 'user.test@example.com',
				sentAt: '2026-09-23T13:35:50.185Z',
				channels: ['newsletter'],
			},
			{
				notificationId: '5717-4562-b3fc-2c963f66afa6-3fa85f64',
				sentBy: 'john.doe@example.com',
				sentAt: '2026-05-23T13:35:50.185Z',
				channels: ['app-alert'],
			},
		],
	};
};

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
	const [previousSends, setPreviousSends] =
		useState<ArticlePreviousSendsResponse>();

	useEffect(() => {
		getPreviousSends(articleId)
			.then(setPreviousSends)
			.catch((err) => console.error(err));
	}, [articleId]);

	const { data, error } = usePreviousNotifications(articleId);
	if (data || error) {
		console.log({ data, error });
	}

	if (!previousSends || previousSends.articleId !== articleId) {
		return null;
	}

	return (
		<div css={style.bar}>
			{previousSends.sends.map((send, index) => (
				<Avatar
					initials={emailToIntials(send.sentBy)}
					key={index}
					alt={send.sentBy}
				/>
			))}
			<Typography>Sent an app alert with this URL</Typography>
			{previousSends.sends.length === 1 ? (
				<Typography>[{previousSends.sends.at(0)?.sentAt}]</Typography>
			) : (
				<Typography>Timestamp</Typography>
			)}
		</div>
	);
};
