import { useEffect, useState } from 'react';
import type { PreviousSend } from '../hooks/usePreviousNotifications';
import { usePreviousNotifications } from '../hooks/usePreviousNotifications';

interface Props {
	articleId?: string;
}

const getPreviousSends = async (
	articleId?: string,
): Promise<PreviousSend[]> => {
	if (!articleId) {
		return [];
	}
	await Promise.resolve();
	return [
		{
			notificationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
			sentBy: 'user@example.com',
			sentAt: '2026-09-23T13:35:50.185Z',
			channels: ['newsletter'],
		},
	];
};

export const PreviousNotificationsBar = ({ articleId }: Props) => {
	const [previousSends, setPreviousSends] = useState<PreviousSend[]>();

	useEffect(() => {
		getPreviousSends(articleId)
			.then(setPreviousSends)
			.catch((err) => console.error(err));
	}, [articleId]);

	const { data } = usePreviousNotifications(articleId);
	console.log('from hook', data);

	return <div>Previous sends= {previousSends?.length}</div>;
};
