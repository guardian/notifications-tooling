import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	spyOn,
} from 'bun:test';

const baseEnv = { STACK: 'notifications', APP: 'dispatch' };

const getSSMParameter = async (key: string, stage: string = 'CODE') => {
	await mock.module('./env', () => ({ env: { ...baseEnv, STAGE: stage } }));
	const { getSSMParameter } = await import('./ssm');
	return getSSMParameter(key);
};

const SESSION_TOKEN = 'test-session-token';

beforeEach(() => {
	process.env.AWS_SESSION_TOKEN = SESSION_TOKEN;
});

afterEach(() => {
	mock.restore();
	delete process.env.AWS_SESSION_TOKEN;
	delete process.env.MY_PARAM;
});

describe('getSSMParameter in production', () => {
	it('fetches the parameter from the extension endpoint and returns its value', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ Parameter: { Value: 'secret-value' } }),
		);

		const EXTENSION_URL =
			'http://localhost:2773/systemsmanager/parameters/get' +
			'?name=%2FCODE%2Fnotifications%2Fdispatch%2Fmy-param&withDecryption=true';

		const value = await getSSMParameter('my-param');

		expect(value).toBe('secret-value');

		const [calledUrl, calledInit] = fetcher.mock.calls[0] ?? [];
		expect((calledUrl as URL).toString()).toEqual(EXTENSION_URL);
		expect(calledInit).toEqual({
			headers: {
				'X-Aws-Parameters-Secrets-Token': SESSION_TOKEN,
			},
		});
	});

	it('decrypts the parameter by requesting withDecryption', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ Parameter: { Value: 'secret-value' } }),
		);

		await getSSMParameter('my-param');

		const calledUrl = fetcher.mock.calls[0]?.[0] as URL;
		expect(calledUrl.searchParams.get('withDecryption')).toBe('true');
	});

	it('converts an UPPER_SNAKE_CASE key to kebab-case in the parameter name', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ Parameter: { Value: 'secret-value' } }),
		);

		await getSSMParameter('BRAZE_API_KEY');

		const calledUrl = fetcher.mock.calls[0]?.[0] as URL;
		expect(calledUrl.searchParams.get('name')).toBe(
			'/CODE/notifications/dispatch/braze-api-key',
		);
	});

	it('throws when AWS_SESSION_TOKEN is not present', () => {
		delete process.env.AWS_SESSION_TOKEN;
		const fetcher = spyOn(globalThis, 'fetch');

		expect(getSSMParameter('my-param')).rejects.toThrow(
			'AWS_SESSION_TOKEN is not set',
		);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('throws when the extension responds with a non-ok status', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('Not Found', { status: 404, statusText: 'Not Found' }),
		);

		expect(getSSMParameter('my-param')).rejects.toThrow(
			'Failed to fetch SSM parameter "my-param": 404 Not Found',
		);
	});
});

describe('getSSMParameter in DEV', () => {
	// In DEV there is no extension layer, so values are read straight from
	// `process.env` instead of being fetched over HTTP.
	it('returns the value from process.env without calling the extension', async () => {
		process.env.MY_PARAM = 'local-value';
		const fetcher = spyOn(globalThis, 'fetch');

		const value = await getSSMParameter('MY_PARAM', 'DEV');

		expect(value).toBe('local-value');
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('throws when the environment variable is not set', () => {
		delete process.env.MY_PARAM;
		const fetcher = spyOn(globalThis, 'fetch');

		expect(getSSMParameter('MY_PARAM', 'DEV')).rejects.toThrow(
			'SSM parameter "MY_PARAM" is not set in DEV environment.',
		);
		expect(fetcher).not.toHaveBeenCalled();
	});
});
