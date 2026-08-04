import type { UserResponse } from '../features/stand-frontend/get-config';

export const mockUserResponse: UserResponse = {
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
