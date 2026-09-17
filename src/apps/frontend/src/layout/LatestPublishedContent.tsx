import { Button } from '@guardian/stand/Button';
import { useState } from 'react';
import { DispatchCreateNotificationModal } from './DispatchCreateNotificationModal';

export const LatestPublishedContent = () => {
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
			/>
		</>
	);
};
