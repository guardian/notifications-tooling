import type { UserResponse } from './types';

export const getUser = async (): Promise<UserResponse> => {
	const userResponseJson: unknown = await fetch('/v1/user', {
		credentials: 'include',
	}).then((response) => response.json());
	return userResponseJson as UserResponse;
};
