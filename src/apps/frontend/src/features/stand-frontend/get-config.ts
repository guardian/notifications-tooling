import type { FrontendConfig } from '../../frontend-config';
import { frontendConfig } from '../../frontend-config';
import type { UserResponse } from './types';

let config: FrontendConfig | undefined = undefined;

export const getAppConfig = async () => {
	if (config) {
		return config;
	}
	try {
		const configJson: unknown = await fetch('/config').then((response) =>
			response.json(),
		);
		config = frontendConfig.parse(configJson);
		return config;
	} catch (err) {
		console.error(err);
		throw new Error('getAppConfig failed');
	}
};

export const getUser = async (
	appConfig: FrontendConfig,
): Promise<UserResponse> => {
	try {
		const { backendUrl } = appConfig;
		const userResponseJson: unknown = await fetch(`${backendUrl}/v1/user`, {
			credentials: 'include',
		}).then((response) => response.json());
		return Promise.resolve(userResponseJson as UserResponse);
	} catch (err) {
		return Promise.reject(err instanceof Error ? err : new Error('UNKNOWN'));
	}
};
