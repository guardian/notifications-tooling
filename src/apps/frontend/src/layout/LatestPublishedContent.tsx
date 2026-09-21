import { Button } from '@guardian/stand/Button';
import { useState } from 'react';
import { DispatchCreateNotificationModal } from './DispatchCreateNotificationModal';

const temporaryArticleUrl =
	'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures';

export const LatestPublishedContent = ({
	articleUrl = temporaryArticleUrl,
}: {
	articleUrl?: string;
}) => {
	const [isCreateNotificationModalOpen, setIsCreateNotificationModalOpen] =
		useState(false);

	return (
		<>
			<Button
				variant="tertiary"
				onPress={() => setIsCreateNotificationModalOpen(true)}
			>
				Open Latest Published Content
			</Button>
			<DispatchCreateNotificationModal
				isOpen={isCreateNotificationModalOpen}
				onOpenChange={setIsCreateNotificationModalOpen}
				articleUrl={articleUrl}
			/>
		</>
	);
};
