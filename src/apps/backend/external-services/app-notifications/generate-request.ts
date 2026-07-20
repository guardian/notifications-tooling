export class AppNotificationRequestNotImplementedError extends Error {
	constructor() {
		super('App notification request generation is not implemented.');
		this.name = 'AppNotificationRequestNotImplementedError';
	}
}

export const generateAppNotificationRequest = (): never => {
	throw new AppNotificationRequestNotImplementedError();
};
