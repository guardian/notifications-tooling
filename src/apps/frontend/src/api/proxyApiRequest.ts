export const proxyApiRequest = (
	request: Request,
	backendBaseUrl: string,
): Promise<Response> => {
	const incomingUrl = new URL(request.url);
	const upstreamUrl = new URL(
		`${incomingUrl.pathname}${incomingUrl.search}`,
		backendBaseUrl,
	);

	return Bun.fetch(new Request(upstreamUrl, request));
};
