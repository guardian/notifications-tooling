export type AppNotificationRequest = {
	topics: ReadonlyArray<{ type: string; name: string }>;
	title: string;
	body: string;
	link: string;
	media?: {
		type: 'image';
		imageUrl: string;
		thumbnailUrl?: string;
	};
};

export const sendAppNotification: (
	request: AppNotificationRequest,
) => Promise<void> = () => Promise.resolve();
