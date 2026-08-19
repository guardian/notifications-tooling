import type { AppConfig } from '@models';

export const mockAppConfig: AppConfig = {
	user: {
		firstName: 'John',
		lastName: 'Doe',
		email: 'j.doe@example.com',
		authenticatingSystem: '',
		authenticatedIn: [],
		expires: 0,
		multifactor: false,
	},
	permissions: ['dispatch_access'],
};
