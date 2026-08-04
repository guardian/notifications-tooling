import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	spyOn,
} from 'bun:test';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const baseEnv = { STACK: 'notifications', APP: 'dispatch' };

const getSSMParameter = async (key: string, stage: string = 'CODE') => {
	await mock.module('./env', () => ({
		configurationStage: stage === 'PROD' ? 'PROD' : 'CODE',
		env: { ...baseEnv, STAGE: stage },
	}));
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
	it('returns a process.env override without calling SSM', async () => {
		process.env.MY_PARAM = 'local-value';
		const fetcher = spyOn(globalThis, 'fetch');
		const send = spyOn(SSMClient.prototype, 'send');

		const value = await getSSMParameter('MY_PARAM', 'DEV');

		expect(value).toBe('local-value');
		expect(fetcher).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});

	it('fetches CODE parameters directly from SSM when no override is set', async () => {
		delete process.env.MY_PARAM;
		const fetcher = spyOn(globalThis, 'fetch');
		const send = spyOn(SSMClient.prototype, 'send').mockResolvedValue({
			Parameter: { Value: 'code-value' },
		} as never);

		const value = await getSSMParameter('MY_PARAM', 'DEV');

		expect(value).toBe('code-value');
		expect(send).toHaveBeenCalledTimes(1);
		expect(send.mock.calls[0]?.[0]).toBeInstanceOf(GetParameterCommand);
		expect((send.mock.calls[0]?.[0] as GetParameterCommand).input).toEqual({
			Name: '/CODE/notifications/dispatch/my-param',
			WithDecryption: true,
		});
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('throws when SSM returns no parameter value', () => {
		delete process.env.MY_PARAM;
		spyOn(SSMClient.prototype, 'send').mockResolvedValue({
			Parameter: {},
		} as never);

		expect(getSSMParameter('MY_PARAM', 'DEV')).rejects.toThrow(
			'SSM parameter "MY_PARAM" has no value.',
		);
	});
});
