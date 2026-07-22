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

export type AppNotificationRequestPlaceholder = {
	status: 'not_implemented';
	request: AppNotificationRequest;
};

export const generateAppNotificationRequest = (
	request: AppNotificationRequest,
): AppNotificationRequestPlaceholder => ({
	status: 'not_implemented',
	request,
});
