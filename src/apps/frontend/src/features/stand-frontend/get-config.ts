import type { UserResponse } from './types';

export const getUser = async (): Promise<UserResponse> => {
	try {
		const userResponseJson: unknown = await fetch('/v1/user', {
			credentials: 'include',
		}).then((response) => response.json());
		return Promise.resolve(userResponseJson as UserResponse);
	} catch (err) {
		return Promise.reject(err instanceof Error ? err : new Error('UNKNOWN'));
	}
};
