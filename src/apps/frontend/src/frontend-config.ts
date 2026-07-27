import z from 'zod';

export const frontendConfig = z.object({
	inProductionMode: z.boolean(),
	backendUrl: z.string(),
	stage: z.string().optional(),
});

export type FrontendConfig = z.infer<typeof frontendConfig>;

const getBackendUrl = (
	BACKEND_URI: string | undefined,
	reqUrl: string,
): string => {
	if (BACKEND_URI) {
		return BACKEND_URI;
	}
	// If BACKEND_URI not configured, derive from the request url
	const url = new URL(reqUrl);
	url.protocol = 'https:';
	url.host = url.host.replace('dispatch.', 'dispatch-backend.');
	return url.origin;
};

export const buildConfig = (
	{
		BACKEND_URI,
		STAGE,
		NODE_ENV,
	}: {
		BACKEND_URI?: string;
		STAGE?: string;
		NODE_ENV?: string;
	},
	reqUrl: string,
): FrontendConfig => {
	return {
		inProductionMode: NODE_ENV === 'production',
		stage: STAGE,
		backendUrl: getBackendUrl(BACKEND_URI, reqUrl),
	};
};
