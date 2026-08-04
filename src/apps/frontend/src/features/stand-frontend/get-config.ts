import type { User } from '@config';

export interface UserResponse {
	user: User;
	permissions: string[];
}

export const getAppConfig = (): Promise<UserResponse | undefined> => {
	return fetch('/v1/user')
		.then((r) => r.json())
		.then((data: unknown) => {
			return data as UserResponse;
		});
};
